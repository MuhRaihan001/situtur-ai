var express = require('express');
var router = express.Router();
const {isLoggedIn, isUser} = require('../../middleware/auth');

router.get('/', isLoggedIn, isUser, function(req,res,next){
    res.render('user/dashboard', {title: 'Situtur | Dashboard', username: req.session.user.username, email: req.session.user.email});
});

module.exports = router;