const express = require("express");
const {
  getAllAccounts,
  getAccount,
  createAccount,
} = require("../controller/account.controller");
const auth = require("../middlewares/protect.middleware");

const router = express.Router();

router.route("/").get(auth, getAllAccounts).post(createAccount);
router.route("/:id").get(getAccount);

module.exports = router;
