const express = require("express");
const { signup, login, restrictTo } = require("../controller/auth.controller");
const { getAllUsers } = require("../controller/user.controller");
const auth = require("../middlewares/protect.middleware");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/").get(auth, restrictTo("admin"), getAllUsers);
module.exports = router;
