const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

function sha256(password) {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
}

exports.GET = function (req, res, next) {
    // Jika request adalah navigasi browser (HTML), biarkan React Router yang handle di frontend
    const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
    if (isHtmlRequest && !req.headers.accept.includes('application/json') && !req.xhr) {
        return next();
    }
    
    // Jika request API, kirim pesan saja
    res.json({ success: true, message: "Register page is handled by frontend" });
};

exports.POST = async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        const { username, acc, confirmPassword, email, namaDepan, namaBelakang, password } = req.body;

        // Sanitize string inputs
        const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
        const sanitizedNamaDepan = sanitizeHtml(namaDepan, { allowedTags: [], allowedAttributes: {} });
        const sanitizedNamaBelakang = sanitizeHtml(namaBelakang, { allowedTags: [], allowedAttributes: {} });
        
        // Gunakan confirmPassword jika acc tidak ada (fleksibilitas antara frontend lama/baru)

        if (!username || !confirmPassword || !email || !namaDepan || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Semua field wajib diisi" 
            });
        }

        // Validasi password match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Password tidak cocok" 
            });
        }

        const role = 'user';
        
        const password_hash = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        const query = "INSERT INTO user (username, nama_depan, nama_belakang, password, email, role) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [username, namaDepan, namaBelakang, password_hash, email, role];
        
        await db.query(query, params);
        
        return res.json({ 
            success: true, 
            message: "Pendaftaran berhasil! Silakan login." 
        });

    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: "Username atau email sudah terdaftar" 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan server saat pendaftaran" 
        });
    }
};