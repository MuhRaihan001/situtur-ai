const {isLoggedIn, isUser} = require('../../middleware/auth');

exports.middleware = [isLoggedIn, isUser];

exports.GET = function (req,res,next){
    res.render('user/settings', {title: 'Situtur | Pengaturan', username: req.session.user.username});
}