var express = require('express');
var router = express.Router();
const {isLoggedIn, isUser} = require('../../middleware/auth');

router.get('/', isLoggedIn, isUser, async function(req, res, next){
    const db = req.app.locals.db;
    
    try {
        // FIX TYPO: req.sesssion → req.session
        const Profile = await db.query(
            'SELECT * FROM user WHERE username = ?', 
            [req.session.user.username]
        );
        
        // Cek jika user tidak ditemukan
        if (Profile.length === 0) {
            return res.status(404).send('User tidak ditemukan');
        }
        
        res.render('user/manage_account', {
            title: 'Situtur | Profile', 
            Profile: Profile[0]  // Ambil data pertama
        });
        
    } catch(error) {
        console.error('[PROFILE ERROR]', error);
        res.status(500).send('Terjadi kesalahan');
    }
});

module.exports = router; 