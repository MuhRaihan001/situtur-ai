exports.GET = function (req, res, next) {
    res.render('index', {
        title: 'Homepage',
        login: 'Login',
        register: 'Register'
    });
};