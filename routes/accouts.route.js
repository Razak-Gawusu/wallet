const express = require("express");
const { createTransactionPin } = require("../controller/account.controller");
const auth = require("../middlewares/protect.middleware");

const router = express.Router();

router.route("/").patch(auth, createTransactionPin);

module.exports = router;
