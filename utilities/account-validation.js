const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};



validate.loginRules = () => {
    return [
        // valid email is required and exists in DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() 
            .withMessage("A valid email is required"),


        //password is required
        body ("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required."),    
    ]
}




/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }
      ),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};



/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors: errors.array(),
            title: "Login",
            nav,
            notice: null,
            ...req.body, // <--- CORRECTED: Add this to repopulate fields
        });
        return;
    }
    next();
};


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  console.log("🔥  Hit checkRegData!  🔥");
  console.log("Body payload:", req.body);
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      notice: null,
      ...req.body, 
    });
  }
  next();
};


/* **********************************
 * Account Update Data Validation Rules
 * ********************************* */
validate.accountUpdateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), 

    // lastname is required and must be a string
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."), 

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() 
      .withMessage("A valid email is required."),
  ];
};

/* **************************************
 * Check data and return errors or continue to account update
 * ************************************ */
validate.checkAccountUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Edit Account",
      nav,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
    });
    return;
  }
  next();
};

/* **********************************
 * Password Change Data Validation Rules
 * ********************************* */
validate.passwordChangeRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])(?!.*\s).{12,}$/)
      .withMessage("Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."),
  ];
};

/* **************************************
 * Check data and return errors or continue to password change
 * ************************************ */
validate.checkPasswordChangeData = async (req, res, next) => {
  const { account_id } = req.body; 
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Edit Account",
      nav,
      accountData: res.locals.accountData, 
    });
    return;
  }
  next();
};



module.exports = validate;
