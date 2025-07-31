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
router.get("/",
  utilities.checkEmployeeAdminAuth,
  invController.buildManagement
);


router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)


// Add Classification Routes
router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  utilities.checkEmployeeAdminAuth,
  invVal.checkClassificationName,
  invVal.handleClassificationErrors,
  invController.insertClassification
)


// Add Inventory Routes
router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  utilities.checkEmployeeAdminAuth,
  invVal.checkInventoryData,           
  invVal.handleInventoryErrors,        
  invController.insertInventory        
)


// Route to build the edit inventory view (ADD THIS NEW ROUTE)
router.get(
  "/edit/:inv_id",
  utilities.checkEmployeeAdminAuth,
  utilities.handleErrors(invController.editInventoryView) 
)


// Route to handle the update inventory data (ADD THIS NEW ROUTE)
router.post(
  "/update/",
  utilities.checkEmployeeAdminAuth,
  invVal.checkInventoryData, 
  invVal.checkUpdateData,    
  utilities.handleErrors(invController.updateInventory) 
)


// Route to build the delete confirmation view
router.get(
  "/delete/:inv_id",
  utilities.checkEmployeeAdminAuth,
  utilities.handleErrors(invController.deleteView) 
);

// Route to handle the actual deletion
router.post(
  "/delete/",
  utilities.checkEmployeeAdminAuth,
  utilities.handleErrors(invController.deleteItem) 
);



module.exports = router;