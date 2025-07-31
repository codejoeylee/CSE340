// utilities/inventory-validation.js

const invModel = require("../models/inventory-model")
const utilities = require(".") 
const { body, validationResult } = require("express-validator")

const inventoryValidation = {}

/*  Validation Rules for Classification */
inventoryValidation.checkClassificationName = [
  body("classification_name")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z]+$/)
    .withMessage("Only alphabetic characters allowed.")
    .custom(async (classification_name) => {
      const exists = await invModel.checkExistingClassification(classification_name)
      if (exists) {
        throw new Error("Classification name already exists.")
      }
    })
]

/*  Validation Rules for Inventory (Used for both Add and Update) */
inventoryValidation.checkInventoryData = [
  body("classification_id").isInt().withMessage("Select a valid classification."),
  body("inv_make").trim().isLength({ min: 3 }).withMessage("Make must be at least 3 characters."),
  body("inv_model").trim().isLength({ min: 3 }).withMessage("Model must be at least 3 characters."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_year").isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}.`),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required.")
]

/*  Error Handling for Classification Form */
inventoryValidation.handleClassificationErrors = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name: req.body.classification_name
    })
    return
  }
  next()
}

/*  Error Handling for Inventory Form (ADD PROCESS) */
inventoryValidation.handleInventoryErrors = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: errors.array(),
      notice: null, 
      ...req.body
    })
    return 
  }
  next()
}

/* Error Handling for Inventory Update Form (UPDATE PROCESS - RENAMED TO checkUpdateData) */
inventoryValidation.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

    const itemName = `${req.body.inv_make} ${req.body.inv_model}`;

    res.render("inventory/edit-inventory", { 
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),
      ...req.body,
    });
    return;
  }
  next();
};


module.exports = inventoryValidation;

