require("express-async-errors");
const express = require("express");
const debuglog = require("./startup/logging");
const app = express();

require("./startup/validation")();
require("./startup/config")();
require("./startup/db")();
require("./startup/routes")(app);

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () =>
  debuglog(`successfully running server on port: ${PORT}`)
);

module.exports = server;
