const {isLoggedIn, isUser} = require('../../middleware/auth');

exports.middleware = [isLoggedIn, isUser];

exports.GET = function (req,res,next){
    res.render('user/Monitor', {title: 'Situtur | Daftar Hadir', username: req.session.user.username});
}