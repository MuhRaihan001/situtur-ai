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
        const query = "SELECT id, method, table_name, reason, created_at FROM query_actions ORDER BY created_at DESC LIMIT 50";
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
                isRead: true // Defaulting to true as we don't have isRead in DB yet
            }))
        });
    } catch (error) {
        console.error("Error in GET /user/notifikation:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
