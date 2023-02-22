const { entries } = require("lodash");
const { User } = require("../models/user.model");

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (key.includes(allowedFields)) obj[key] = value;
  });
  return newObj;
};

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
};

const updateMe = async (req, res) => {};

module.exports = {
  getAllUsers,
  updateMe,
};
