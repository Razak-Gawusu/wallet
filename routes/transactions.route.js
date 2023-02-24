const express = require("express");
const {
  fundAccount,
  transferFund,
} = require("../controller/transaction.controller");
const auth = require("../middlewares/protect.middleware");

const router = express.Router();
router.route("/fundAccount").post(auth, fundAccount);
router.route("/transferFund").post(auth, transferFund);

module.exports = router;
