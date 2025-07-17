// models/test-model.js

const db = require("../database");

async function testConnection() {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ Connected to DB. Time:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();
