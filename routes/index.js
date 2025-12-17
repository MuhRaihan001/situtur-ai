var express = require('express');
var router = express.Router();

// loadApi sebagai middleware
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Homepage',
        login: 'Login',
        register: 'Register'
    });
});

module.exports = router;
