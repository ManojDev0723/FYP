require("dotenv").config();
const db = require("./config/db");

async function migrateOTP() {
  try {
    console.log("Starting OTP migration for users table...");
    
    // Check existing columns first
    const [columns] = await db.query("SHOW COLUMNS FROM users");
    const columnNames = columns.map(c => c.Field);
    
    const queries = [];
    
    if (!columnNames.includes("otp")) {
      queries.push("ADD COLUMN otp VARCHAR(6)");
    }
    if (!columnNames.includes("otp_expiry")) {
      queries.push("ADD COLUMN otp_expiry DATETIME");
    }
    if (!columnNames.includes("is_verified")) {
      queries.push("ADD COLUMN is_verified TINYINT(1) DEFAULT 0");
    }

    if (queries.length > 0) {
      const sql = `ALTER TABLE users ${queries.join(", ")}`;
      console.log("Executing:", sql);
      await db.query(sql);
      console.log("Migration successful.");
    } else {
      console.log("All columns already exist. No migration needed.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateOTP();
