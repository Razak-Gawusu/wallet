const mongoose = require("mongoose");
const Joi = require("joi");
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

  optExpires: Date,
});

otpSchema.methods.isExpired = async function () {
  return this.optExpires > Date.now();
};
otpSchema.pre("save", function (next) {
  this.optExpires = Date.now() + 1000 * 60;
  next();
});

const Otp = mongoose.model("Otp", otpSchema);

const validateOtp = (data) => {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    pin: Joi.string(),
  });
  return schema.validate(data);
};

module.exports = {
  Otp,
  validateOtp,
};
