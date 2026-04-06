require("dotenv").config();
const db = require("./config/db");

async function migrateCoupons() {
  try {
    console.log("Starting migration for coupons table...");
    
    // Check existing columns first
    const [columns] = await db.query("SHOW COLUMNS FROM coupons");
    const columnNames = columns.map(c => c.Field);
    
    const queries = [];
    
    if (!columnNames.includes("userid")) {
      queries.push("ADD COLUMN userid INT");
    }
    if (!columnNames.includes("dealid")) {
      queries.push("ADD COLUMN dealid INT");
    }
    if (!columnNames.includes("merchantid")) {
      queries.push("ADD COLUMN merchantid INT");
    }
    if (!columnNames.includes("status")) {
      queries.push("ADD COLUMN status ENUM('unused', 'used') DEFAULT 'unused'");
    }
    if (!columnNames.includes("expiresat")) {
      queries.push("ADD COLUMN expiresat DATE");
    }
    if (!columnNames.includes("createdat")) {
      queries.push("ADD COLUMN createdat DATETIME DEFAULT CURRENT_TIMESTAMP");
    }

    if (queries.length > 0) {
      const sql = `ALTER TABLE coupons ${queries.join(", ")}`;
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

migrateCoupons();
