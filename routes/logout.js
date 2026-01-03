exports.GET = function (req, res) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('[LOGOUT ERROR]', err);
                return res.status(500).json({ success: false, message: 'Gagal logout' });
            }
            res.clearCookie('connect.sid');
            res.clearCookie('userData');
            return res.json({ success: true, message: 'Logout berhasil' });
        });
    } else {
        return res.json({ success: true, message: 'Sudah logout' });
    }
};

exports.POST = exports.GET;
