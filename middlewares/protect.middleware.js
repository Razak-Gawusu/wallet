const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("../util/error.util");
const config = require("config");
const { User } = require("../models/user.model");

module.exports = async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("Access denied, no token", 401));
  const decoded = await promisify(jwt.verify)(
    token,
    config.get("jwtPrivateKey")
  );

  const user = await User.findById(decoded._id);
  if (!user)
    return next(new AppError("User with this token no longer exits", 401));

  const isExpired = await user.isExpiredToken(decoded.iat);
  if (isExpired)
    return next(
      new AppError("user has changed password, please login again", 401)
    );

  req.user = user;

  next();
};
