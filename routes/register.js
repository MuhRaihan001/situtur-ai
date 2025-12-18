var express = require('express');
const argon2 = require("argon2");
var router = express.Router();
const sanitizeHtml = require('sanitize-html');

router.get('/', function (req, res, next) {
    res.render('register', { title: 'Register' })
})

router.post('/', async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        if(req.body.password == req.body.acc){
        const username = req.body.username;
        const password = req.body.acc;
        const email = req.body.email;
        const nama_depan = req.body.namaDepan;
        const nama_belakang = req.body.namaBelakang;
        const role = 'user';



        const password_hash = await argon2.hash(password, {
            type: argon2.argon2id,
            timeCost: 1,        // cepat
            memoryCost: 2 ** 16 
        });
        
        const query = "INSERT INTO user (username, nama_depan, nama_belakang, password, email, role) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [username, nama_depan,nama_belakang, password_hash, email, role];
        
        db.query(query, params, function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Gagal menyimpan" });
            }
            res.redirect('/login');
        });
    }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error server" });
    }

})
module.exports = router;