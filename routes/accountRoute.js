const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

// Login route
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post("/register", utilities.handleErrors(accountController.registerAccount));


module.exports = router;
