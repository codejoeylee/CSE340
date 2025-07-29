const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()

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


module.exports = { buildLogin, buildRegister, registerAccount , accountLogin , buildAccount};

