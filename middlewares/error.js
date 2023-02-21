const debuglog = require("../startup/logging");
const { logError } = require("../startup/logging");
const AppError = require("../util/error.util");

function handleDuplicateFieldsDB(err) {
  console.log(err);
  const message = `Duplicate field value x, please use another value`;
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
    let error = { ...err };

    if (err.name === "CastError") {
      error = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    sendErrorProd(res, error);
  }

  next();
};
