const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

function sha256(password) {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
}

exports.POST = async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        // Validasi password match
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ success: false, message: "Password tidak cocok" });
        }

        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const nama_depan = req.body.namaDepan;
        const nama_belakang = req.body.namaBelakang;
        const role = 'user';

        const password_hash = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        const query = "INSERT INTO user (username, nama_depan, nama_belakang, password, email, role) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [username, nama_depan, nama_belakang, password_hash, email, role];
        
        await db.query(query, params);
        
        return res.json({ success: true, message: "User berhasil didaftarkan" });

    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Username atau email sudah terdaftar" });
        }
        
        return res.status(500).json({ success: false, message: "Error server" });
    }
};