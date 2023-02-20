const mongoose = require("mongoose");
const Joi = require("joi");
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
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Boolean,
      required: true,
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

accountSchema.virtual("dollarAmount").get(function () {
  return this.amount / 12;
});

// accountSchema.pre("save", async function (next) {
//   const salt = await genSalt(10);
//   debuglog(this.number);
//   this.number = await hash(this.number, salt);

//   next();
// });

// accountSchema.pre(/^find/, function (next) {
//   this.find({}).select("-number");
//   next();
// });

const Account = mongoose.model("Account", accountSchema);

function validateAccount(data) {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    number: Joi.number().min(15).max(15),
    amount: Joi.number().min(0),
    active: Joi.boolean(),
  });
  return schema.validate(data);
}

module.exports = {
  Account,
  validateAccount,
};
