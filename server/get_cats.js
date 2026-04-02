require("dotenv").config();
const db = require("./config/db");
async function run() {
  const [rows] = await db.query("SELECT name FROM categories");
  console.log(rows.map(r => r.name));
  process.exit(0);
}
run();
