require("dotenv").config();
require("express-async-errors");
const config = require("config");
const express = require("express");
const debuglog = require("./startup/logging");
const app = express();

require("./startup/validation")();
require("./startup/config")();
require("./startup/db")();
require("./startup/routes")(app);

const PORT = 5050;
const server = app.listen(PORT, () =>
  debuglog(`successfully running server on port: ${PORT}`)
);

module.exports = server;
