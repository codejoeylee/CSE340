// models/inventory-model.js

const pool = require("../database"); // adjust path to your pool

/* ***************************
 * Get all classifications
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
         ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
  }
}


/* ***************************
 * Get vehicle by inventory ID (This is redundant with getInventoryById, consider consolidating)
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory WHERE inventory_id = $1`, // ✔️ corrected column name
      [inv_id]
    );
    return data.rows[0]; // returns just one vehicle
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}


async function addClassification(classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
  const result = await pool.query(sql, [classification_name]);
  return result.rows[0];
}


async function insertInventoryItem(data) {
  const sql = `INSERT INTO inventory 
    (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;

  const values = [
    data.inv_make,
    data.inv_model,
    data.inv_year,
    data.inv_description,
    data.inv_image,
    data.inv_thumbnail,
    data.inv_price,
    data.inv_miles,
    data.inv_color,
    data.classification_id
  ];

  const result = await pool.query(sql, values);
  return result.rows[0];
}



/* ***************************
 * Get inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inventory_id = $1`, // Correct column name used
      [inv_id]
    )
    return data.rows[0]; // Return only the first (and should be only) matching row
  } catch (error) {
    console.error("getInventoryById error: " + error);
    throw error; // Re-throw to be caught by handleErrors in the controller
  }
}


/* ***************************
 * Update Inventory Data (ADD THIS NEW FUNCTION)
 * ************************** */
async function updateInventory(
  inv_id, // This will be the value for inventory_id in the WHERE clause
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inventory_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id // inv_id must be last here to match $11 in the SQL query
    ])
    return data.rows[0] // Return the updated item's data
  } catch (error) {
    console.error("updateInventory model error: " + error) // More specific error log
    throw error // Re-throw the error for the controller to catch
  }
}




/* ***************************
 * Delete Inventory Item (ADD THIS NEW FUNCTION)
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inventory_id = $1'; // Use inventory_id column name
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount; // This will return the QueryResult object, data.rowCount will be 1 on success
  } catch (error) {
    console.error("Delete Inventory Error: " + error); // More specific error message
    throw new Error("Delete Inventory Error"); // Re-throw a generic error for consistency
  }
}


module.exports = {
  insertInventoryItem,
  addClassification,
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  getInventoryById,
  updateInventory,
  deleteInventoryItem,
};
