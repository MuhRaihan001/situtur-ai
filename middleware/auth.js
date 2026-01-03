const Tokenizer = require("../handler/token");
const token = new Tokenizer();

const checkRole = (role) => (req, res, next) => {
  const rawData = req.signedCookies.userData;

  if (!rawData)
    return res.status(401).send("Unauthorized");

  let data;
  try {
    data = token.verify(rawData);
  } catch {
    return res.status(400).send("Invalid cookie data");
  }

  if (data.role === role)
    return next();

  return res.status(403).send("You don't have access for this action");
};

exports.isLoggedIn = (req, res, next) => {
  const rawData = req.signedCookies.userData;
  if (!rawData) return res.status(401).send("Unauthorized");
  try {
    token.verify(rawData);
    next();
  } catch {
    return res.status(401).send("Unauthorized");
  }
};

exports.isAdmin = checkRole('admin');
exports.isUser  = checkRole('user');
