// routes/login.js

const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

function sha256(password) {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
}

exports.GET = function (req, res, next) {
    res.render('login', { title: 'Login' });
};

exports.POST = async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        const username = sanitizeHtml(req.body.username);
        const password = req.body.password;

        console.log('[DEBUG] username input:', username);

        const sql = "SELECT * FROM user WHERE username = ?";
        
        // GUNAKAN AWAIT, BUKAN CALLBACK!
        const results = await db.query(sql, [username]);
        
        console.log('[DEBUG] hasil query:', results);

        // user tidak ditemukan
        if (results.length === 0) {
            console.log('[DEBUG] user tidak ditemukan');
            return res.status(401).json({ 
                success: false, 
                message: "Username atau password salah" 
            });
        }

        const user = results[0];

        console.log('[DEBUG] hash dari DB:', user.password);

        // verifikasi password
        const hashedPassword = sha256(password);
        const match = hashedPassword === user.password;
        console.log('[DEBUG] hasil verify:', match);

        if (!match) {
            console.log('[DEBUG] password tidak cocok');
            return res.status(401).json({ 
                success: false, 
                message: "Username atau password salah" 
            });
        }

        // simpan session
        req.session.user = {
            id_user: user.id_user,
            username: user.username,
            email: user.email,
            role: user.role,
            nama_depan: user.nama_depan,
            nama_belakang: user.nama_belakang
        };

        console.log('[DEBUG] session dibuat:', req.session.user);

        // Simpan session dengan Promise
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('[DEBUG] Gagal simpan session:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log('[DEBUG] session tersimpan, mengirim respon sukses');

        return res.json({
            success: true,
            message: 'Login berhasil',
            redirect: user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
            user: req.session.user
        });

    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server: ' + error.message
        });
    }
};