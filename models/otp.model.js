const mongoose = require("mongoose");
const Joi = require("joi");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  pin: {
    type: String,
    required: true,
  },

  optExpiresAt: Date,
});

otpSchema.methods.isExpired = function () {
  return Date.now() > this.optExpiresAt;
};

otpSchema.methods.generateOtp = function () {
  let arr = [];
  for (let i = 0; i < 4; i++) {
    arr.push(Math.floor(Math.random() * 10));
  }
  return arr.join("");
};

otpSchema.pre("save", function (next) {
  this.pin = crypto.createHash("sha256").update(this.pin).digest("hex");
  this.optExpiresAt = Date.now() + 1000 * 60;
  next();
});

const Otp = mongoose.model("Otp", otpSchema);

const validateOtp = (data) => {
  const schema = Joi.object({
    pin: Joi.string().min(4).max(4),
  });
  return schema.validate(data);
};

module.exports = {
  Otp,
  validateOtp,
};
