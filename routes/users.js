var express = require('express');
var router = express.Router();
const {isLoggedIn, isAdmin, isUser} = require('../middleware/auth');

router.get('/', isLoggedIn, isUser, function(req,res,next){
    res.render('user/dashboard', {title: 'Situtur | Dashboard', username: req.session.user.username});
});

module.exports = router;