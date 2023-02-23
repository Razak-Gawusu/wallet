const _ = require("lodash");
const crypto = require("crypto");
const {
  User,
  validateSignup,
  validateLogin,
  validateForgetPassword,
  validateResetPassword,
  validateUpdatePassword,
} = require("../models/user.model");

const { Otp, validateOtp } = require("../models/otp.model");
const AppError = require("../util/error.util");
const sendEmail = require("../util/email.util");

const signup = async (req, res) => {
  const { error } = validateSignup(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const user = new User({
    name: {
      first: req.body.first,
      last: req.body.last,
    },
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const pin = user.generateOtp();
  const otp = new Otp({
    user: user._id,
    pin,
  });
  if (!otp) throw new AppError("error otp", 400);
  await user.save();
  await otp.save();

  const message = `Your verification code is ${pin}`;

  try {
    await sendEmail({ email: user.email, subject: "Verify Account", message });

    const token = user.generateAuthToken();
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: _.pick(user, ["_id", "fullName", "email", "phone", "role"]),
      },
    });
  } catch (error) {
    await User.findByIdAndRemove(user._id);
    throw new AppError("Try again, something bad happen during signup", 500);
  }
};

const resendOTP = async (req, res) => {
  const _id = req.user._id;
  console.log(_id);

  const user = await User.findById(_id);

  console.log(user.fullName);
  const otp = await Otp.findOne({ user: _id });

  console.log(otp);
  const pin = user.generateOtp();

  otp.pin = pin;
  otp.save();

  const message = `Your verification code is ${pin}`;

  try {
    await sendEmail({ email: user.email, subject: "Verify Account", message });

    const token = user.generateAuthToken();
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: _.pick(user, ["_id", "fullName", "email", "phone", "role"]),
      },
    });
  } catch (error) {
    await User.findByIdAndRemove(user._id);
    throw new AppError("Try again, something bad happen during signup", 500);
  }
};

const verifyOTP = async (req, res) => {
  const _id = req.user._id;

  const { error } = validateOtp(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  hashPin = crypto.createHash("sha256").update(req.body.pin).digest("hex");

  const otp = await Otp.findOne({ user: _id, pin: hashPin });
  console.log(otp);
  if (!otp) throw new AppError("Invalid otp, try again", 401);

  isExpired = await otp.isExpired();
  if (isExpired) throw new AppError("Otp has expired, try again");

  const user = await User.findById(otp.user);
  user.active = true;
  user.save({ validateBeforeSave: false });

  await Otp.findByIdAndRemove(otp._id);

  res.status(200).json({
    status: "success",
    message: "successfully verified account",
  });
};

const login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user) throw new AppError("Invalid email or password", 400);

  const isValid = await user.isValidPassword(req.body.password, user.password);
  if (!isValid) throw new AppError("Invalid email or password", 400);

  const token = user.generateAuthToken();

  res.status(201).json({
    status: "success",
    token,
  });
};

const forgotPassword = async (req, res) => {
  const { error } = validateForgetPassword(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError("Email does not exist", 404);

  const resetToken = await user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/wallet/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password send a patch request with your new password to ${resetUrl} \n If you didn't forget password please ignore this.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(err.message, 500);
  }
};

const resetPassword = async (req, res) => {
  const { error } = validateResetPassword(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const hashResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    throw new AppError(
      "Invalid reset token or reset token has expired, please try again"
    );

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = user.generateAuthToken();
  res.status(200).json({
    status: "success",
    token,
  });
};

const updatePassword = async (req, res) => {
  const { error } = validateUpdatePassword(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const user = await User.findById(req.user._id).select("+password");
  const isValid = await user.isValidPassword(
    req.body.currentPassword,
    user.password
  );
  if (!isValid) throw new AppError("Invalid password", 401);

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  const token = user.generateAuthToken();
  res.status(200).json({
    status: "success",
    token,
  });
};

const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(`You don't have permission to perform this action`, 403)
      );
    next();
  };
};

module.exports = {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  resendOTP,
};
