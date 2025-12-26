const {isLoggedIn, isAdmin, isUser} = require('../middleware/auth');


exports.GET = {
    middleware: [isLoggedIn, isUser],
    handler: function (req, res, next) {
        res.render('user/dashboard', {title: 'Situtur | Dashboard', username: req.session.user.username});
    }
}