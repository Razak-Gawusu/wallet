const jwt = require("jsonwebtoken");
const AppError = require("../util/error.util");
const config = require("config");

module.exports = function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("Access denied, please login", 401));

  const decoded = jwt.verify(token, config.get("walletJwtPrivateKey"));

  if (decoded) return next(new AppError("Access denied, please login", 401));
};
