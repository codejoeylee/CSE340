const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  if (!data || data.length === 0) {
    // fallback title if inventory is empty
    return res.status(404).render("inventory/classification", {
      title: "No Vehicles Found",
      nav,
      grid
    });
  }


  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const invId = req.params.invId;
  const vehicle = await invModel.getVehicleById(invId);
  const html = utilities.buildVehicleDetail(vehicle);
  let nav = await utilities.getNav();

  const name = vehicle.inv_make + " " + vehicle.inv_model;

  res.render("./inventory/detail", {
    title: name,
    nav,
    vehicleHtml: html
  });
};


/* ***************************
 *  Build management
 * ************************** */
invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav();
  req.flash("notice", "Welcome to Inventory Management");
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null
  });
};


/* ***************************
 *  Build addclassification
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  });
};



/* ***************************
 *  Insert Classification()
 * ************************** */
invCont.insertClassification = async function (req, res) {
  const nav = await utilities.getNav();
  const { classification_name } = req.body;

  const result = await invModel.addClassification(classification_name);

  if (result) {
    const updatedNav = await utilities.getNav(); // Refresh nav bar
    req.flash("notice", `Classification '${classification_name}' added successfully.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add classification.");
    res.status(500).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    });
  }
};


/* ***************************
 *  Add inventory controller
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null
  });
};





/* ***************************
 *  Insert Inventory()
 * ************************** */
invCont.insertInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList(req.body.classification_id);

  const result = await invModel.insertInventoryItem(req.body);

  if (result) {
    req.flash("notice", "Inventory item added successfully.");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add inventory item.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      ...req.body // for sticky fields
    });
  }
};




// This throws a real error to test the middleware
invCont.throwError = (req, res, next) => {
  throw new Error("Intentional server error triggered for testing.");
};



module.exports = invCont