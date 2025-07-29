// routes/inventoryRoute.js

// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invVal = require("../utilities/inventory-validation");
const utils = require("../utilities");
const utilities = require("../utilities");


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildVehicleDetail);
router.get("/trigger-error", invController.throwError);


// Inventory Management View
router.get("/", invController.buildManagement);


router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)


// Add Classification Routes
router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  invVal.checkClassificationName,
  invVal.handleClassificationErrors,
  invController.insertClassification
)


// Add Inventory Routes
router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  invVal.checkInventoryData,           // Validation Rules
  invVal.handleInventoryErrors,        // Middleware for error handling
  invController.insertInventory        // Proceed if no errors
)


// Route to build the edit inventory view (ADD THIS NEW ROUTE)
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView) // Use the name you choose in the controller
)


// Route to handle the update inventory data (ADD THIS NEW ROUTE)
router.post(
  "/update/",
  invVal.checkInventoryData, // Apply existing validation rules
  invVal.checkUpdateData,    // Use the new checkUpdateData middleware
  utilities.handleErrors(invController.updateInventory) // This function will be created next
)


// Route to build the delete confirmation view
router.get(
  "/delete/:inv_id", // Parameter to get the specific item to delete
  utilities.handleErrors(invController.deleteView) // Controller function to deliver the view
);

// Route to handle the actual deletion
router.post(
  "/delete/",
  utilities.handleErrors(invController.deleteItem) // Controller function to carry out the delete
);



module.exports = router;