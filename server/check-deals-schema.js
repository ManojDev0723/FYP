require("dotenv").config();
const db = require("./config/db");
const fs = require("fs");

async function checkDealsSchema() {
  try {
    const [rows] = await db.query("DESCRIBE deals");
    fs.writeFileSync("deals_schema.txt", JSON.stringify(rows, null, 2));
    console.log("Schema saved to deals_schema.txt");
    process.exit(0);
  } catch (error) {
    console.error("Error fetching schema:", error);
    process.exit(1);
  }
}

checkDealsSchema();
