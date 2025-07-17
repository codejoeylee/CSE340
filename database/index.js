// database/index.js

const { Pool } = require("pg");
require("dotenv").config();

// Determine environment
const isDev = process.env.NODE_ENV === "development";

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !isDev ? { rejectUnauthorized: false } : false, // Use SSL in production
});

// Log queries and return results
async function query(text, params) {
  if (isDev) {
    console.log("Executing SQL:", text);
  }
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error("DB Query Error:", err.message);
    throw err;
  }
}

// Export for use in models
module.exports = {
  query,
  pool,
};

