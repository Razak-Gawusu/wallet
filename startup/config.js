const config = require("config");
const AppError = require("../util/error.util");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    throw new AppError(
      "FATAL ERROR - jwtPrivateKey not set, please set and try again",
      500
    );
  }
};
