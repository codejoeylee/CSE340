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




module.exports = {
  insertInventoryItem,
  addClassification,
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById, 
};



