require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log("Adding status column to business table...");
    await db.query("ALTER TABLE business ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active'");
    console.log("Migration successful.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Column 'status' already exists.");
    } else {
      console.error("Migration failed:", error);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
