const {isLoggedIn, isUser} = require('../../middleware/auth');

exports.middleware = [isLoggedIn, isUser];

exports.GET = function (req,res,next){
    res.render('user/ToDoList', {title: 'Situtur | Daftar', username: req.session.user.username});
}