const {isLoggedIn, isUser} = require('../../middleware/auth');

exports.middleware = [isLoggedIn, isUser];

exports.GET = function (req,res,next){
    res.render('user/List_Workers', {title: 'Situtur | Daftar Pekerja', username: req.session.user.username});
}
