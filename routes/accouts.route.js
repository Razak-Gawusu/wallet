const express = require("express");
const {
  getAllAccounts,
  getAccount,
  createAccount,
} = require("../controller/account.controller");

const router = express.Router();

router.route("/").get(getAllAccounts).post(createAccount);
router.route("/:id").get(getAccount);

module.exports = router;
