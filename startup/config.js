const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    throw new Error(
      "FATAL ERROR - jwtPrivateKey not set, please set and try again"
    );
  }
};
