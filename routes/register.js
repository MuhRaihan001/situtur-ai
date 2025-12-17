var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
const sanitizeHtml = require('sanitize-html');

router.get('/', function (req, res, next) {
    res.render('register', { title: 'Register' })
})

router.post('/', async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        const username = req.body.username;
        const password = req.body.acc;
        const email = req.body.email;
        const nama_depan = req.body.namaDepan;
        const nama_belakang = req.body.namaBelakang;
        const role = 'user';

        const saltRounds = 10;

        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = "INSERT INTO user (username, nama_depan, nama_belakang, password, email, role) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [username, nama_depan,nama_belakang, password_hash, email, role];

        db.query(query, params, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Gagal menyimpan" });
            } else {

            }

            res.redirect('/login');
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error server" });
    }

})
module.exports = router;