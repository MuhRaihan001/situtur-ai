var express = require('express');
var router = express.Router();
const argon2 = require('argon2');
const sanitizeHtml = require('sanitize-html');

router.get('/', function (req, res) {
    res.render('login', { title: 'Login' });
});

router.post('/', function (req, res, next) {
    const db = req.app.locals.db;

    const username = sanitizeHtml(req.body.username);
    const password = req.body.password;

    console.log('[DEBUG] username input:', username);

    const sql = "SELECT * FROM user WHERE username = ?";
    
    db.query(sql, [username], async (err, results) => {
        try {
            if (err) {
                console.error('[DB ERROR]', err);
                return next(err);
            }
            
            console.log('[DEBUG] hasil query:', results);

            // user tidak ditemukan
            if (results.length === 0) {
                console.log('[DEBUG] user tidak ditemukan');
                return res.send("username atau password salah");
            }

            const user = results[0];

            console.log('[DEBUG] hash dari DB:', user.password);

            // verifikasi password
            const match = await argon2.verify(user.password, password);

            console.log('[DEBUG] hasil verify:', match);

            if (!match) {
                return res.send("username atau password salah");
            }

            // simpan session
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };

            console.log('[DEBUG] session dibuat:', req.session.user);

            // redirect sesuai role
            if (user.role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/users');
            }

        } catch (error) {
            console.error('[LOGIN ERROR]', error);
            next(error);
        }
    });
});

module.exports = router;
