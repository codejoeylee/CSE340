// models/inventory-model.js

const pool = require("../database"); // adjust path to your pool

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * 
       FROM public.inventory AS i
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
 *  Get vehicle by inventory ID
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



module.exports = {
  addClassification,
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById, 
};



