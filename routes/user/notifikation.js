const {isLoggedIn, isUser} = require('../../middleware/auth');

exports.middleware = [isLoggedIn, isUser];

exports.GET = function (req,res,next){
    res.render('user/Notification', {title: 'Situtur | Notifikasi', username: req.session.user.username});
}