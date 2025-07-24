const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const validate = require("../utilities/account-validation");
const accountController = require("../controllers/accountController");

// Deliver login and register views
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Handle registration with validation
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post("/login", accountController.loginHandler);



module.exports = router;
