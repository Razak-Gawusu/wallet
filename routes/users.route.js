const express = require("express");
const {
  signup,
  login,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controller/auth.controller");
const { getAllUsers } = require("../controller/user.controller");
const auth = require("../middlewares/protect.middleware");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/updateMyPassword").patch(auth, updatePassword);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);
router.route("/").get(auth, restrictTo("admin"), getAllUsers);
module.exports = router;
