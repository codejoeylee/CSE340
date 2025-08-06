const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");
const accountController = require("../controllers/accountController");


// Route to build account management view
router.get("/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccount)
)


// Deliver login and register views
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Handle registration with validation
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  accountController.accountLogin,
  utilities.handleErrors(accountController.accountLogin)
);


/* **************************************
 * New Routes for Account Management
 * **************************************/

// Route to deliver the account update view (Protected by checkLogin and checkAccountOwnership)
router.get(
  "/update/:account_id",
  utilities.checkLogin, // Ensures user is logged in
  utilities.checkAccountOwnership, // Ensures user is updating their own account (implement this in utilities/index.js if not already)
  utilities.handleErrors(accountController.buildAccountUpdate)
);

// Route to process the account update form submission (Protected)
router.post(
  "/update",
  utilities.checkLogin, // Ensures user is logged in
  regValidate.accountUpdateRules(), // Validation rules for account details
  regValidate.checkAccountUpdateData, // Middleware to check validation results
  utilities.handleErrors(accountController.updateAccount)
);

// Route to process the password change form submission (Protected)
router.post(
  "/change-password",
  utilities.checkLogin, 
  regValidate.passwordChangeRules(), 
  regValidate.checkPasswordChangeData, 
  utilities.handleErrors(accountController.changePassword)
);

// Route for logout (Publicly accessible, but clears JWT)
router.get(
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
);


// Route to display all user accounts (NEW ROUTE)
router.get(
  "/manage-users",
  utilities.checkAdminAuth, // Only Employee or Admin can access
  utilities.handleErrors(accountController.buildAccountList)
);


module.exports = router;
