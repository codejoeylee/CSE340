// routes/inventoryRoute.js

// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invVal = require("../utilities/inventory-validation");
const utils = require("../utilities");


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildVehicleDetail);
router.get("/trigger-error", invController.throwError);


// Inventory Management View
router.get("/", invController.buildManagement);

// Add Classification Routes
router.get("/add-classification", invController.buildAddClassification);
router.post("/add-classification",
  invVal.checkClassificationName,
  utils.handleErrors(invController.insertClassification)
);

// Add Inventory Routes
router.get("/add-inventory", invController.buildAddInventory);
router.post("/add-inventory",
  invVal.checkInventoryData,
  utils.handleErrors(invController.insertInventory)
);



module.exports = router;