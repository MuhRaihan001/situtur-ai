const {isLoggedIn, isAdmin, isUser} = require('../../middleware/auth');
const Tokenizer = require('../../handler/token');
const token = new Tokenizer();

exports.middleware = [ isLoggedIn, isUser ]

exports.GET =  async function (req, res, next) {
    const db = req.app.locals.db;
    
    try {
        const rawData = req.signedCookies.userData;
        const user = await token.verify(rawData);
        
        const Profile = await db.query(
            'SELECT * FROM user WHERE username = ?', 
            [user.username]
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
}
