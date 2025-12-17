var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next){
    res.render('login', {title: 'Login'})
})

router.post('/', function(req,res,next){
    const db = req.app.locals.db;
})
module.exports = router;