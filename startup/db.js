const mongoose = require("mongoose");
const config = require("config");
const debuglog = require("./logging");

module.exports = async function (next) {
  const db = config.get("mongodb_uri");
  mongoose.set("strictQuery", false);

  try {
    const connect = await mongoose.connect(db);
    if (connect) debuglog(`successfully connect to ${db}`);
  } catch (err) {
    debuglog(err.message);
  }
};
