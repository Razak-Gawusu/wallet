const mongoose = require("mongoose");
const config = require("config");
const debuglog = require("./logging");

module.exports = function () {
  const db = config.get("mongodb_uri");
  mongoose.set("strictQuery", false);
  mongoose.connect(db).then(() => debuglog(`successfully connect to ${db}`));
};
