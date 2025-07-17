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


// This throws a real error to test the middleware
invCont.throwError = (req, res, next) => {
  throw new Error("Intentional server error triggered for testing.");
};



module.exports = invCont