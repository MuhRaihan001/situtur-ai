const { Meta } = require("../../handler/meta");
const Works = require("../../handler/work");
const { isUser } = require("../../middleware/auth");
const Tokenizer = require("../../handler/token");

const work = new Works();
const token = new Tokenizer();

module.exports = {
    middleware: [isUser],
    GET: {
        handler: async function (req, res) {
            try {
                const db = req.app.locals.db;
                const id_proyek = req.query.id_proyek || req.query.project_id;
                
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData);
                const id_user = user.id_user;

                // Jika ada id_proyek, validasi kepemilikan
                if (id_proyek) {
                    const checkProject = await db.query(
                        "SELECT ID FROM proyek WHERE ID = ? AND Id_User = ?",
                        [id_proyek, id_user]
                    );

                    if (checkProject.length === 0) {
                        return res.status(403).json({
                            success: false,
                            message: "Anda tidak memiliki akses ke proyek ini atau proyek tidak ditemukan."
                        });
                    }
                }

                const works = await work.list(id_proyek);
                res.status(200).json({
                    success: true,
                    works: works.works,
                    team_size: works.team_size,
                    project: works.project
                });
            } catch (error) {
                console.error("Error in GET /works/list:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },

        meta: new Meta()
            .setSummary("Mengambil daftar karya")
            .setDescription(
                "Endpoint ini digunakan untuk mengambil seluruh data karya yang tersimpan dalam sistem."
            )
            .setTags("Works")
            .setOperationId("getWorksList")
            .addQueryParam("project_id", "Filter berdasarkan ID proyek", false, "integer") // Tambah param ini
            .addSuccessResponse("Berhasil mengambil daftar karya", {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1
                        },
                        work_name: {
                            type: "string",
                            example: "Pembuatan API OpenAI"
                        },
                        progress: {
                            type: "integer",
                            example: 80
                        },
                        status: {
                            type: "string",
                            example: "on_progress"
                        },
                        started_at: {
                            type: "string",
                            example: "2025-12-25"
                        },
                        finished_at: {
                            type: "string",
                            example: "30 Desember 2025 18.00.00"
                        }
                    }
                }
            })
            .addNotFoundResponse("Tidak ada data karya")
            .addServerErrorResponse()
            .build()
    }

};
