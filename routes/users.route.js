const express = require("express");
const { signup } = require("../controller/auth.controller");
const { getAllUsers } = require("../controller/user.controller");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/").get(getAllUsers);
module.exports = router;
