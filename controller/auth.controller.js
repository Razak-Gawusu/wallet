const _ = require("lodash");
const { User, validateSignup, validateLogin } = require("../models/user.model");
const AppError = require("../util/error.util");

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
  });

  await user.save();

  const token = user.generateAuthToken();
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: _.pick(user, ["_id", "fullName", "email", "phone", "role"]),
    },
  });
};

const login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  const isValid = await user.isValidPassword(req.body.password, user.password);

  if (!user || !isValid) throw new AppError("Invalid email or password", 400);

  const token = user.generateAuthToken();

  res.status(201).json({
    status: "success",
    token,
  });
};

module.exports = { signup, login };
