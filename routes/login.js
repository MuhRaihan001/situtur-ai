var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
const sanitizeHtml = require('sanitize-html');

router.get('/', function(req,res,next){
    res.render('login', {title: 'Login'})
})

router.post('/', function(req,res,next){
    const db = req.app.locals.db;
  
    const username = sanitizeHtml(req.body.username);
    const password = req.body.password; // password TIDAK perlu sanitize
  
    const sql = "SELECT * FROM user WHERE username = ?";
  
    db.query(sql, [username], async (err, results) => {
        if (err) return next(err);
    
        // cek user ada atau tidak
        if (results.length === 0) {
            return res.send("username atau password salah");
        }

        const user = results[0];

    // cocokkan password (plaintext vs hash)
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.send("username atau password salah");
        }

    // jika password benar → buat session
        req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
        };

        // redirect sesuai role
        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/users');
        }
    });
})
module.exports = router;