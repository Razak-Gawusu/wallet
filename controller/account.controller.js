const mongoose = require("mongoose");
const _ = require("lodash");
const {
  Account,
  validateCreateTransactionPin,
} = require("../models/account.model");
const AppError = require("../util/error.util");

const createTransactionPin = async (req, res) => {
  const { error } = validateCreateTransactionPin(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const account = await Account.findOne({ user: req.user._id });

  const hashPin = await account.hashAccountPin(req.body.pin);
  account.pin = hashPin;
  account.isActive = true;
  await account.save();

  res.status(201).json({
    status: "success",
    message: "Successfully created transaction pin",
    data: {
      account: _.pick(account, ["balance", "number"]),
    },
  });
};

module.exports = {
  createTransactionPin,
};
