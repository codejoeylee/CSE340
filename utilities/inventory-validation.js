// utilities/inventory-validation.js
const { body } = require("express-validator");

const checkClassificationName = [
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("No spaces or special characters allowed.")
];

const checkInventoryData = [
  body("inv_make").notEmpty().withMessage("Make is required."),
  body("inv_model").notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900 }).withMessage("Valid year required."),
  body("inv_price").isFloat().withMessage("Price must be a number."),
  body("inv_miles").isInt().withMessage("Miles must be an integer."),
  body("inv_color").notEmpty().withMessage("Color is required.")
  // Add more rules as needed
];

module.exports = { checkClassificationName, checkInventoryData };
