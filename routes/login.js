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
            return res.status(401).send("username atau password salah");
        }

        const user = results[0];

        console.log('[DEBUG] hash dari DB:', user.password);

        // verifikasi password
        const hashedPassword = sha256(password);
        const match = hashedPassword === user.password;
        console.log('[DEBUG] hasil verify:', match);

        if (!match) {
            return res.status(401).send("username atau password salah");
        }

        // simpan session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        console.log('[DEBUG] session dibuat:', req.session.user);

        // Simpan session dengan Promise
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('[DEBUG] session tersimpan');

        // redirect sesuai role
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/user/dashboard');
        }

    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        return res.status(500).send("Terjadi kesalahan server");
    }
};