var express = require('express');
const crypto = require('crypto');
var router = express.Router();
const sanitizeHtml = require('sanitize-html');

router.get('/', function (req, res, next) {
    res.render('register', { title: 'Register' });
});

router.post('/', async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        // Validasi password match
        if (req.body.password !== req.body.acc) {
            return res.status(400).send("Password tidak cocok");
        }

        const username = req.body.username;
        const password = req.body.acc;
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
        
        // GUNAKAN AWAIT, BUKAN CALLBACK!
        await db.query(query, params);
        
        console.log('[DEBUG] User berhasil didaftarkan');
        return res.redirect('/login');

    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send("Username atau email sudah terdaftar");
        }
        
        return res.status(500).send("Error server");
    }
});

module.exports = router;