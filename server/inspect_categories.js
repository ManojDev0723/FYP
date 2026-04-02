require("dotenv").config();
const db = require("./config/db");
async function inspectCategories() {
  try {
    const [rows] = await db.query("SELECT * FROM categories");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
inspectCategories();
