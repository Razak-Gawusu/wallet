const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const debuglog = require("../startup/logging");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 15,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pin: {
      type: String,
    },
    isActive: {
      type: Boolean,
      required: function () {
        return this.pin !== undefined;
      },
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

accountSchema.methods.generateAccountNumber = function () {
  let arr = [1, 0, 0, 1, 0];
  for (let i = 0; i < 10; i++) {
    arr.push(Math.floor(Math.random() * 10));
  }
  return Number(arr.join(""));
};

accountSchema.methods.hashAccountPin = async function (pin) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pin, salt);
};

accountSchema.methods.isValidPin = async function (pin, hashedPin) {
  return bcrypt.compare(pin, hashedPin);
};

accountSchema.methods.getCurrencyAmount = function (currency, amount) {
  if (currency === "naira") return amount;

  return amount * 12;
};
accountSchema.virtual("dollarAmount").get(function () {
  return this.amount / 12;
});

const Account = mongoose.model("Account", accountSchema);

function validateCreateTransactionPin(data) {
  const schema = Joi.object({
    pin: Joi.string().required(),
  });
  return schema.validate(data);
}

module.exports = {
  Account,
  validateCreateTransactionPin,
};
