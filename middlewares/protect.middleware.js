const jwt = require("jsonwebtoken");
const AppError = require("../util/error.util");
const config = require("config");

module.exports = async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("Access denied, no token", 401));

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded._id;
    next();
  } catch (err) {
    next(new AppError(err.message, 401));
  }
};
