const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { body, validationResult } = require("express-validator");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
    const nav = await utilities.getNav();
    req.flash("notice", "Welcome to the login page!");
    res.render("account/login", {
        title: "Login",
        nav
    });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
    const nav = await utilities.getNav();
    req.flash("notice", "Welcome to the Registration page!");
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    });
}

async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing your registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    });
  }

  //  Save the hashed password to the database
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", { title: "Login", nav });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", { title: "Register", nav });
  }
}


/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
    }

    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

            res.cookie("jwt", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "lax",
                maxAge: 3600 * 1000
            })

            return res.redirect("/account/")

        } else {
            req.flash("notice", "Please check your credentials and try again.")
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        console.error("Login error:", error)
        req.flash("notice", "An expected error occurred.")
        return res.status(500).render("account/login",{
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
      } 
    }
  

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  let account_firstname = "User"

  try{
    const token = req.cookies.jwt
    if (token) {
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        account_firstname = decoded.account_firstname
    }
  } catch (err) {
    console.error("JWT decode error:", err)
  }
  
  res.render("account/account-management", {
  title: "Account Management",
  nav,
  errors: null,
  account_firstname: res.locals.accountData?.account_firstname || "User"
})
}




/* ****************************************
 * Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id);
  // Fetch account data from the database using the model
  const accountData = await accountModel.getAccountById(account_id);

  // If accountData is not found (shouldn't happen if checkLogin/checkAccountOwnership are good)
  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/");
  }

  // Set title and render the view
  let nav = await utilities.getNav();
  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null, // No errors initially
    accountData, // Pass the account data to the view for sticky fields
  });
}

/* ****************************************
 * Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  // Checking for validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors,
      accountData: {
        account_id, 
        account_firstname,
        account_lastname,
        account_email,
      },
    });
  }

  try {
    // Get current account data to check if email is actually changing
    const currentAccount = await accountModel.getAccountById(account_id);
    if (!currentAccount) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    // Checking if the new email already exists and is different from the current one
    if (account_email !== currentAccount.account_email) {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        req.flash("notice", "Email already exists. Please use a different email.");
        return res.render("account/update", {
          title: "Edit Account",
          nav,
          errors: null, 
          accountData: {
            account_id,
            account_firstname,
            account_lastname,
            account_email, 
          },
        });
      }
    }

    // Calling the model function to update account information
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    );

    if (updateResult) {
      req.flash("notice", "Account information updated successfully.");
      const updatedAccountData = await accountModel.getAccountById(account_id);
      res.locals.accountData = updatedAccountData; 
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Failed to update account information. Please try again.");
      return res.render("account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        accountData: {
          account_id,
          account_firstname,
          account_lastname,
          account_email,
        },
      });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash("notice", "An error occurred during account update.");
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
    });
  }
}

/* ****************************************
 * Process password change
 * *************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors,
      accountData: res.locals.accountData, 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10); 

    const updateResult = await accountModel.updatePassword(
      hashedPassword,
      account_id
    );

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/"); 
    } else {
      req.flash("notice", "Failed to change password. Please try again.");
      return res.render("account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    req.flash("notice", "An error occurred during password change.");
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    });
  }
}

/* ****************************************
 * Process logout (Task 6)
 * *************************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt"); 
  req.flash("notice", "You have been logged out.");
  return res.redirect("/"); 
}


/* ****************************************
* Deliver Account List view (NEW FUNCTION)
* *************************************** */
async function buildAccountList(req, res, next) {
  let nav = await utilities.getNav();
  try {
    const accountList = await accountModel.getAllAccounts();
    res.render("account/account-list", {
      title: "All User Accounts",
      nav,
      errors: null,
      accountList, // Pass the list of accounts to the view
    });
  } catch (error) {
    console.error("buildAccountList controller error:", error);
    req.flash("notice", "Failed to load user accounts.");
    res.redirect("/account/"); // Redirect to account management on error
  }
}





module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildAccountUpdate,
  updateAccount,
  accountLogout,
  buildAccountList,
};

