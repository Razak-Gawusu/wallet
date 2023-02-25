const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      first: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50,
        capitalize: true,
        trim: true,
      },
      last: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50,
        capitalize: true,
        trim: true,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      maxLength: 50,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 13,
      match: [/\+233\d{9}/, "Please fill a valid phone number"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "A password field is required"],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "A password confirmation field is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    photo: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"), {
    expiresIn: config.get("jwtExpiresIn"),
  });
};

userSchema.methods.isValidPassword = async function (
  inputPassword,
  hashPassword
) {
  return bcrypt.compare(inputPassword, hashPassword);
};

userSchema.methods.isExpiredToken = async function (tokenIat) {
  if (!this.passwordChangedAt) return false;
  const changePwdTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return changePwdTime > tokenIat;
};

userSchema.methods.generateResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.virtual("fullName").get(function () {
  return this.name.first + " " + this.name.last;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;

  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

const User = mongoose.model("User", userSchema);

function validateSignup(data) {
  const schema = Joi.object({
    first: Joi.string().min(2).max(50).required(),
    last: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(50).required().email(),
    phone: Joi.string().min(13).max(13).required(),
    password: Joi.string().min(8).max(255).required(),
    confirmPassword: Joi.string().min(8).max(255).required(),
    passwordChangedAt: Joi.date(),
  });
  return schema.validate(data);
}

function validateLogin(data) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(50).required().email(),
    password: Joi.string().min(8).max(255).required(),
  });
  return schema.validate(data);
}

function validateForgetPassword(data) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(50).required().email(),
  });

  return schema.validate(data);
}

function validateResetPassword(data) {
  const schema = Joi.object({
    password: Joi.string().min(8).max(255).required(),
    confirmPassword: Joi.string().min(8).max(255).required(),
  });

  return schema.validate(data);
}

function validateUpdatePassword(data) {
  const schema = Joi.object({
    currentPassword: Joi.string().min(8).max(255).required(),
    password: Joi.string().min(8).max(255).required(),
    confirmPassword: Joi.string().min(8).max(255).required(),
  });

  return schema.validate(data);
}

module.exports = {
  User,
  validateSignup,
  validateLogin,
  validateForgetPassword,
  validateResetPassword,
  validateUpdatePassword,
};
