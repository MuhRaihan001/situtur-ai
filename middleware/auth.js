exports.isLoggedIn = function (req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/');
}

exports.isAdmin = function (req, res, next) {
  if (req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).send("Akses khusus admin");
}

exports.isUser = function (req, res, next) {
  if (req.session.user.role === 'user') {
    return next();
  }
  return res.status(403).send("Akses khusus user");
}