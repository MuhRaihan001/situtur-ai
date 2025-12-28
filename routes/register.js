const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

function sha256(password) {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
}

exports.GET = function (req, res, next) {
    res.render('register', { title: 'Register' });
};

exports.POST = async function (req, res, next) {
    const db = req.app.locals.db;

    try {
        if (req.body.password !== req.body.acc) {
            return res.status(400).json({ message: "Password tidak cocok" });
        }

        const username = sanitizeHtml(req.body.username);
        const password = req.body.acc;
        const email = sanitizeHtml(req.body.email);
        const nama_depan = sanitizeHtml(req.body.namaDepan);
        const nama_belakang = sanitizeHtml(req.body.namaBelakang);
        const role = 'user';

        const password_hash = await argon2.hash(password, {
            type: argon2.argon2id,
            timeCost: 1,
            memoryCost: 2 ** 16 
        });
        
        const query = "INSERT INTO user (username, nama_depan, nama_belakang, password, email, role) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [username, nama_depan, nama_belakang, password_hash, email, role];
        
        db.query(query, params, function (err, result) {
            if (err) {
                console.error('[REGISTER ERROR]', err);
                return res.status(500).json({ message: "Gagal menyimpan" });
            }
            res.redirect('/login');
        });

    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        res.status(500).json({ message: "Error server" });
    }
};