const { Meta } = require("../../handler/meta");
const Database = require("../../handler/database");
const AuditService = require("../../handler/audit");
const { isLoggedIn, isUser } = require("../../middleware/auth");
const Tokenizer = require("../../handler/token");
const db = new Database();
const token = new Tokenizer();
module.exports = {
    middleware: [isLoggedIn, isUser],
    GET: {
        handler: async function (req, res) {
            try {
                const rawData = req.signedCookies.userData;
                const data = await token.verify(rawData);
                console.log(data)

                const id_user = data.id_user;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const search = req.query.search || '';

                let baseQuery = `
                    SELECT 
                        p.ID,
    p.Nama_Proyek,
    p.status,
    p.due_date,
    ROUND(
        IFNULL(
            (SUM(CASE WHEN w.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(w.id), 0)) * 100, 
            0
        )
    ) AS progress
FROM proyek p
LEFT JOIN work w ON p.ID = w.id_Proyek
LEFT JOIN user u ON u.id_user = p.id_user
WHERE p.Id_User = ?
GROUP BY p.ID, p.Nama_Proyek, p.status, p.due_date`;
                
                const params = [id_user];
                if (search) {
                    baseQuery += ` AND p.Nama_Proyek LIKE ?`;
                    params.push(`%${search}%`);
                }

                const result = await db.queryWithPagination(baseQuery, params, page, limit);
                
                // Calculate growth for projects
                const now = new Date();
                const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                
                const totalProjectsRows = await db.query(
                    'SELECT COUNT(*) as count FROM proyek WHERE Id_User = ?',
                    [id_user]
                );
                const totalProjects = totalProjectsRows[0] ? totalProjectsRows[0].count : 0;

                const lastMonthProjectsRows = await db.query(
                    'SELECT COUNT(*) as count FROM proyek WHERE Id_User = ? AND created_at < ?',
                    [id_user, firstDayThisMonth]
                );
                const lastMonthProjects = lastMonthProjectsRows[0] ? lastMonthProjectsRows[0].count : 0;
                const growth = lastMonthProjects === 0 ? 0 : ((totalProjects - lastMonthProjects) / lastMonthProjects * 100).toFixed(1);

                res.status(200).json({
                    success: true,
                    message: "Berhasil mengambil daftar proyek",
                    projects: result.data.map(p => ({
                        id: p.ID,
                        name: p.Nama_Proyek,
                        id_user: p.Id_User,
                        location: "Jakarta", 
                        progress: p.progress,
                        status: p.status,
                        dueDate: p.due_date
                    })),
                    stats: {
                        total: totalProjects,
                        inProgress: result.data.filter(p => p.status === 'In Progress' || p.status === 'Pending').length,
                        completed: result.data.filter(p => p.status === 'Compleated').length,
                        growth: (growth >= 0 ? '+' : '') + growth + '%'
                    },
                    pagination: result.pagination
                });
            } catch (error) {
                console.error("Error in GET /user/List_Projek:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Mengambil daftar proyek dengan paginasi")
            .setDescription("Endpoint ini digunakan untuk mengambil data proyek milik user dengan dukungan paginasi dan pencarian.")
            .setTags("Projects")
            .addQueryParam("page", "Halaman ke-n", false, "number")
            .addQueryParam("limit", "Jumlah data per halaman", false, "number")
            .addQueryParam("search", "Kata kunci pencarian nama proyek", false, "string")
            .build()
    },
    POST: {
        handler: async function (req, res) {
            try {
                const { name } = req.body;
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData)
                const id_user = user.id_user;

                // 1. Strict Validation
                if (!name || typeof name !== 'string' || name.trim().length < 3) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Nama proyek wajib diisi (minimal 3 karakter)" 
                    });
                }

                // 2. Atomic Transaction for Create + Audit
                const projectId = await db.transaction(async (tx) => {
                    const insertQuery = "INSERT INTO proyek (Nama_Proyek, Id_User) VALUES (?, ?)";
                    const result = await tx.safeQuery(insertQuery, [name.trim(), id_user]);
                    return result.insertId;
                });

                // 3. Audit Logging
                await AuditService.log({
                    action: 'CREATE',
                    tableName: 'proyek',
                    recordId: projectId,
                    newValues: { name: name.trim(), id_user }
                }, req);

                res.status(201).json({ 
                    success: true, 
                    message: "Proyek berhasil ditambahkan", 
                    projectId 
                });
            } catch (error) {
                console.error("Error in POST /user/List_Projek:", error);
                res.status(500).json({ success: false, message: "Gagal menambahkan proyek" });
            }
        }
    },
    PUT: {
        handler: async function (req, res) {
            try {
                const { id, name } = req.body;
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData);
                const id_user = user.id_user;

                // 1. Validation
                if (!id || !name || name.trim().length < 3) {
                    return res.status(400).json({ success: false, message: "ID dan Nama Proyek (min 3 char) wajib diisi" });
                }

                // 2. Atomic Transaction: Check ownership -> Update -> Audit
                const result = await db.transaction(async (tx) => {
                    // Fetch old values for audit
                    const oldValues = await tx.safeQuery("SELECT Nama_Proyek FROM proyek WHERE ID = ? AND Id_User = ?", [id, id_user]);
                    
                    if (oldValues.length === 0) {
                        throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
                    }

                    const updateQuery = "UPDATE proyek SET Nama_Proyek = ? WHERE ID = ? AND Id_User = ?";
                    const updateResult = await tx.safeQuery(updateQuery, [name.trim(), id, id_user]);
                    
                    return { updateResult, oldValues: oldValues[0] };
                });

                // 3. Audit
                await AuditService.log({
                    action: 'UPDATE',
                    tableName: 'proyek',
                    recordId: id,
                    oldValues: result.oldValues,
                    newValues: { name: name.trim() }
                }, req);

                res.status(200).json({ success: true, message: "Proyek berhasil diperbarui" });
            } catch (error) {
                if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
                    return res.status(404).json({ success: false, message: "Proyek tidak ditemukan atau Anda tidak memiliki akses" });
                }
                console.error("Error in PUT /user/List_Projek:", error);
                res.status(500).json({ success: false, message: "Gagal memperbarui proyek" });
            }
        }
    },
    DELETE: {
        handler: async function (req, res) {
            try {
                const { id } = req.body;
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData);
                const id_user = user.id_user;

                if (!id) return res.status(400).json({ success: false, message: "ID Proyek wajib diisi" });

                // Atomic Transaction: Fetch -> Delete -> Audit
                const deletedData = await db.transaction(async (tx) => {
                    const oldData = await tx.safeQuery("SELECT * FROM proyek WHERE ID = ? AND Id_User = ?", [id, id_user]);
                    
                    if (oldData.length === 0) {
                        throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
                    }

                    const deleteQuery = "DELETE FROM proyek WHERE ID = ? AND Id_User = ?";
                    await tx.safeQuery(deleteQuery, [id, id_user]);
                    
                    return oldData[0];
                });

                // Audit
                await AuditService.log({
                    action: 'DELETE',
                    tableName: 'proyek',
                    recordId: id,
                    oldValues: deletedData
                }, req);

                res.status(200).json({ success: true, message: "Proyek berhasil dihapus" });
            } catch (error) {
                if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
                    return res.status(404).json({ success: false, message: "Proyek tidak ditemukan atau Anda tidak memiliki akses" });
                }
                console.error("Error in DELETE /user/List_Projek:", error);
                res.status(500).json({ success: false, message: "Gagal menghapus proyek" });
            }
        }
    }
};
