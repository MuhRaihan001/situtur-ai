var express = require('express');
var router = express.Router();
const {isLoggedIn, isUser} = require('../../middleware/auth');

router.get('/', isLoggedIn, isUser, function(req,res,next){
    res.render('user/Monitor.ejs')
})

module.exports = router;