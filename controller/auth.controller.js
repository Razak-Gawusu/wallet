const { User, validateUser } = require("../models/user.model");

const signup = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error)
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });

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

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
};

module.exports = { signup };
