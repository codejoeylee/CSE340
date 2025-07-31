const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()

  if (!data || data.length === 0) {
    return res.status(404).render("inventory/classification", {
      title: "No Vehicles Found",
      nav,
      grid
    })
  }

  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid
  })
}

/* ***************************
 * Build single vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const invId = req.params.invId
  const vehicle = await invModel.getVehicleById(invId)
  const html = utilities.buildVehicleDetail(vehicle)
  const nav = await utilities.getNav()

  const name = `${vehicle.inv_make} ${vehicle.inv_model}`

  res.render("inventory/detail", {
    title: name,
    nav,
    vehicleHtml: html
  })
}

/* ***************************
 * Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  const notice = req.flash("notice")[0] || null
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    notice, // Pass the retrieved notice to the view
    errors: null,
    classificationSelect,
  })
}

/* ***************************
 * Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

/* ***************************
 * Insert Classification
 * ************************** */
invCont.insertClassification = async function (req, res) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", `Classification '${classification_name}' added successfully.`)
    res.redirect("/inv/")
  } else {
    // This notice is for re-rendering the same page on failure
    req.flash("notice", "Failed to add classification.")
    const notice = req.flash("notice")[0] || null;
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      notice,
      errors: null
    })
  }
}

/* ***************************
 * Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classifications = await invModel.getClassifications()
    const classificationList = await utilities.buildClassificationList(classifications)
    const notice = req.flash("notice")[0] || null

    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      notice: null,
      errors: null,
      ...req.body
    })
  } catch (error) {
    console.error("Error in buildAddInventory:", error)
    next(error)
  }
}

/* ***************************
 * Insert Inventory
 * ************************** */
invCont.insertInventory = async function (req, res) {
  // ⭐️ CORRECTED: Fetch nav and classifications once at the top
  const nav = await utilities.getNav()
  const classifications = await invModel.getClassifications()
  const classificationList = await utilities.buildClassificationList(classifications)
  let notice

  try {
    const result = await invModel.insertInventoryItem(req.body)

    if (result) {
      req.flash("notice", "Inventory item added successfully.")
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Failed to add inventory item.")
      notice = req.flash("notice")[0] || null
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        notice,
        errors: null,
        ...req.body
      })
    }
  } catch (error) {
    console.error("🚨 Inventory insert failed:", error.message)
    req.flash("notice", "An unexpected error occurred while adding inventory.")
    notice = req.flash("notice")[0] || null
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      notice,
      errors: [{ msg: "Something went wrong. Please try again." }],
      ...req.body
    })
  }
}

/* ***************************
 * Trigger intentional error
 * ************************** */
invCont.throwError = (req, res, next) => {
  throw new Error("Intentional server error triggered for testing.")
}



/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);

  // Add a console.log here to see what invData actually contains
  console.log("Data from invModel.getInventoryByClassificationId:", invData);

  // Safely check if invData is an array and if it contains any elements
  if (Array.isArray(invData) && invData.length > 0) { // <--- CORRECTED CHECK
    return res.json(invData);
  } else {
    // If no data is found, send an empty array back to the client
    // This is generally better than a 500 error for "no results"
    console.log(`No inventory found for classification_id: ${classification_id}`);
    return res.json([]); // <--- Send an empty array if no data
  }
};


/* ***************************
 * Build edit inventory view (ADD THIS NEW FUNCTION)
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); // Ensure the ID from the URL is an integer
  let nav = await utilities.getNav();

  // Fetch the item data from the database using the inventory ID
  const itemData = await invModel.getInventoryById(inv_id);

  // --- VERY IMPORTANT DEBUGGING STEP ---
  // Add this console.log to confirm itemData contains inventory_id
  console.log("itemData fetched for edit:", itemData);
  // You should see itemData.inventory_id: <a number> in your server console when you load the edit page.
  // --- END DEBUGGING STEP ---

  // Build the classification list, pre-selecting the item's classification
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null, 

    inv_id: itemData.inventory_id, 
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  });
};


/* ***************************
 * Update Inventory Data (ADD THIS NEW FUNCTION)
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  console.log("Received req.body for update:", req.body);
  let nav = await utilities.getNav();
  const {
    inv_id, 
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body; 

  // Call the model function to perform the update
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  // Handle the result of the update
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/"); 
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null, 
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
};


/* ***************************
 * Build delete confirmation view
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); 
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id); 

  if (!itemData) {
    req.flash("notice", "Sorry, that vehicle could not be found.");
    return res.redirect("/inv/"); 
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("inventory/delete-confirm", { 
    title: "Delete " + itemName, 
    nav,
    errors: null, 
    inv_id: itemData.inventory_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles, 
    inv_color: itemData.inv_color, 
  });
};


/* ***************************
 * Process Delete Inventory
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id); 
  const deleteResult = await invModel.deleteInventoryItem(inv_id); 

  if (deleteResult) { 
    req.flash("notice", `The deletion was successful.`);
    res.redirect("/inv/"); 
  } else {
    const itemData = await invModel.getInventoryById(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    req.flash("notice", `Sorry, the delete failed for ${itemName}.`);
    res.redirect(`/inv/delete/${inv_id}`); 
  }
};


module.exports = invCont