const Joi = require("joi");
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["deposit", "transfer"],
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      enum: ["naira", "dollar"],
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.methods.isValidStatus = function (balance, amount) {
  if (balance > amount) return true;
  return false;
};

const Transaction = mongoose.model("Transaction", transactionSchema);

function validateTransaction(data) {
  const schema = Joi.object({
    type: Joi.string().required(),
    accountNumber: Joi.number(),
    currency: Joi.string().required(),
    amount: Joi.number().min(1).required(),
    pin: Joi.string().min(4).max(4),
  });
  return schema.validate(data);
}

module.exports = {
  Transaction,
  validateTransaction,
};
