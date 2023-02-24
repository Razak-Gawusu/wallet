const express = require("express");
const error = require("../middlewares/error");
const AppError = require("../util/error.util");
const users = require("../routes/users.route");
const accounts = require("../routes/accouts.route");
const transactions = require("../routes/transactions.route");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/wallet/api/v1/users", users);
  app.use("/wallet/api/v1/accounts", accounts);
  app.use("/wallet/api/v1/transactions", transactions);

  app.all("*", (req, res, next) => {
    const err = new AppError(
      `Can't find ${req.originalUrl} on this server`,
      404
    );

    next(err);
  });
  app.use(error);
};
