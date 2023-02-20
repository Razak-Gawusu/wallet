const mongoose = require("mongoose");
const { Account, validateAccount } = require("../models/account.model");
const AppError = require("../util/error.util");

const getAllAccounts = async (req, res) => {
  const accounts = await Account.find({}).populate("user");
  res.status(200).json({
    status: "success",
    data: {
      accounts,
    },
  });
};

const getAccount = async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) throw new AppError("Account not found", 404);

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
};

const createAccount = async (req, res) => {
  const { error } = validateAccount(req.body);
  if (error) throw new AppError(error.details[0].message, 404);

  const account = new Account({
    user: req.body.userId,
  });

  account.number = account.generateAccountNumber();
  await account.save();

  res.status(201).json({
    status: "success",
    message: "Successfully created resource",
    data: {
      account,
    },
  });
};

module.exports = {
  getAccount,
  getAllAccounts,
  createAccount,
};
