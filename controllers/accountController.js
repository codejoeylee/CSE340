const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");

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


async function loginHandler(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    //  Check if the email exists
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
      req.flash("notice", "Email not found. Please register.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email
      });
    }

    //  Compare password using bcrypt
    const match = await bcrypt.compare(account_password, accountData.account_password);

    if (!match) {
      req.flash("notice", "Incorrect password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email
      });
    }

    //  Store session data
    req.session.accountId = accountData.account_id;
    req.session.accountName = accountData.account_firstname;
    req.session.accountEmail = accountData.account_email;

    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`);
    res.redirect("/account/dashboard"); // or wherever your dashboard lives

  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("notice", "Something went wrong. Please try again.");
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      account_email
    });
  }
}



module.exports = { buildLogin, buildRegister, registerAccount , loginHandler};

