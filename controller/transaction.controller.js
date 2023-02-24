const { Account } = require("../models/account.model");
const _ = require("lodash");

const {
  Transaction,
  validateTransaction,
} = require("../models/transaction.model");
const AppError = require("../util/error.util");

const fundAccount = async (req, res) => {
  const account = await Account.findOne({ user: req.user._id, isActive: true });
  if (!account)
    throw new AppError("Please create transaction pin to active account", 400);

  const { error } = validateTransaction(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  if (req.body.currency !== "naira" && req.body.currency !== "dollar")
    throw new AppError("Currency has to be either naira or dollar", 400);

  const transaction = new Transaction({
    type: req.body.type,
    to: account._id,
    amount: parseInt(req.body.amount),
    currency: req.body.currency,
  });

  try {
    await transaction.save();
  } catch (err) {
    transaction.status = false;
    await transaction.save();
    throw new AppError(err.message, 500);
  }

  const amount = account.getCurrencyAmount(
    req.body.currency,
    parseInt(req.body.amount)
  );
  account.balance = account.balance + amount;
  await account.save();

  res.status(200).json({
    status: "success",
    message: "Successfully deposited money",
    data: {
      account: _.pick(account, ["balance"]),
    },
  });
};

const transferFund = async (req, res) => {
  const account = await Account.findOne({ user: req.user._id, isActive: true });
  if (!account)
    throw new AppError("Please create transaction pin to active account", 400);

  const { error } = validateTransaction(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  if (!(await account.isValidPin(req.body.pin, account.pin)))
    throw new AppError("Invalid Pin, enter correct pin", 400);

  if (req.body.currency !== "naira" && req.body.currency !== "dollar")
    throw new AppError("Currency has to be either naira or dollar", 400);

  const depositAccount = await Account.findOne({
    number: parseInt(req.body.accountNumber),
    isActive: true,
  });
  if (!depositAccount) throw new AppError("Invalid account number", 400);

  const transaction = new Transaction({
    type: req.body.type,
    from: account._id,
    to: depositAccount._id,
    amount: parseInt(req.body.amount),
    currency: req.body.currency,
  });

  const amount = account.getCurrencyAmount(
    req.body.currency,
    parseInt(req.body.amount)
  );

  if (transaction.isValidStatus(account.balance, amount)) {
    transaction.status = true;
    account.balance = account.balance - amount;
    depositAccount.balance = depositAccount.balance + amount;
  }

  await transaction.save();
  await account.save();
  await depositAccount.save();

  res.status(200).json({
    status: "success",
    message: "Successfully transfered money",
    data: {
      account: _.pick(account, ["balance"]),
    },
  });
};

module.exports = {
  fundAccount,
  transferFund,
};
