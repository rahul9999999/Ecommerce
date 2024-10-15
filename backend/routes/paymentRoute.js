
const express = require("express");
const { proceedPayment, sendApiKey} = require("../controllers/paymentController");
const router = express.Router();
const { isAuthentication  } = require("../middleware/auth");


router.route("/payment/process").post(isAuthentication, proceedPayment);

router.route("/stripeapikey").get(isAuthentication,sendApiKey);

module.exports = router;