const { isLoggedIn, isUser } = require('../../middleware/auth');
const Database = require("../../handler/database");
const db = new Database();

exports.middleware = [isLoggedIn, isUser];

exports.GET = async function (req, res, next) {
    // Jika request adalah HTML, biarkan ditangani oleh middleware/routing React
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return next();
    }

    try {
        const query = "SELECT id, method, table_name, reason, created_at, is_read FROM query_actions ORDER BY created_at DESC LIMIT 50";
        const notifications = await db.query(query);
        
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil daftar notifikasi",
            notifications: notifications.map(n => ({
                id: n.id,
                title: n.method.toUpperCase() + " pada " + n.table_name,
                message: n.reason,
                time: new Date(n.created_at).toLocaleString('id-ID'),
                type: n.method === 'insert' ? 'success' : n.method === 'update' ? 'info' : n.method === 'delete' ? 'error' : 'warning',
                isRead: !!n.is_read
            }))
        });
    } catch (error) {
        console.error("Error in GET /user/notifikation:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

exports.PUT = async function (req, res) {
    const { id, all } = req.body;

    try {
        if (all) {
            await db.query("UPDATE query_actions SET is_read = TRUE WHERE is_read = FALSE");
        } else if (id) {
            await db.query("UPDATE query_actions SET is_read = TRUE WHERE id = ?", [id]);
        } else {
            return res.status(400).json({ success: false, message: "ID atau parameter 'all' diperlukan" });
        }

        res.status(200).json({ success: true, message: "Notifikasi berhasil ditandai sebagai dibaca" });
    } catch (error) {
        console.error("Error in PUT /user/notifikation:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

exports.DELETE = async function (req, res) {
    const { id } = req.body;

    try {
        if (id) {
            await db.query("DELETE FROM query_actions WHERE id = ?", [id]);
            res.status(200).json({ success: true, message: "Notifikasi berhasil dihapus" });
        } else {
            return res.status(400).json({ success: false, message: "ID diperlukan" });
        }
    } catch (error) {
        console.error("Error in DELETE /user/notifikation:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
