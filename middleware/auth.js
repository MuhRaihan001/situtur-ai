function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/'); // balik ke login
}

function isAdmin(req, res, next) {
  if (req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).send("Akses khusus admin");
}

function isUser(req, res, next) {
  if (req.session.user.role === 'user') {
    return next();
  }
  return res.status(403).send("Akses khusus user");
}

module.exports = { 
    isLoggedIn,
    isAdmin,
    isUser
};