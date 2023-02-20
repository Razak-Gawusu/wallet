const { User } = require("../models/user.model");

exports.getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
};
