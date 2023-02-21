const debuglog = require("../startup/logging");
const { logError } = require("../startup/logging");
const AppError = require("../util/error.util");

function handleJWTError() {
  return new AppError("Invalid jwt", 401);
}

function handleTokenExpiredError() {
  return new AppError("jwt expired, please login", 401);
}

function handleDuplicateFieldsDB(err) {
  const el = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1 /);
  const message = `Duplicate field value ${el}, please use another value`;
  const error = new AppError(message, 400);
  return error;
}

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new AppError(message, 400);
  return error;
}

function sendErrorDev(res, err) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}
function sendErrorProd(res, err) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logError("Error", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

module.exports = function (err, req, res, next) {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") {
      err = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }

    if (err.name === "JsonWebTokenError") {
      err = handleJWTError();
    }

    if (err.name === "TokenExpiredError") {
      err = handleTokenExpiredError();
    }

    sendErrorProd(res, err);
  }

  next();
};
