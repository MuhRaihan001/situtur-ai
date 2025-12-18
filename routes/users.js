var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next){
    res.render('user/dashboard', {title: 'Situtur | Dashboard', username: req.session.user.username})
})

module.exports = router;