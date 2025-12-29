exports.isLoggedIn = function (req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  // Jika request AJAX atau mengharapkan JSON, kirim 401
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
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