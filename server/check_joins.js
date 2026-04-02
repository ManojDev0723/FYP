require("dotenv").config();
const db = require("./config/db");
async function run() {
  const [allDeals] = await db.query("SELECT * FROM deals");
  console.log("Total deals in table:", allDeals.length);

  const [activeDeals] = await db.query("SELECT * FROM deals WHERE status = 'active'");
  console.log("Active deals in table:", activeDeals.length);

  const [joinedDeals] = await db.query(`
    SELECT d.dealid
    FROM deals d
    JOIN business b ON d.businessid = b.businessid
    JOIN categories c ON d.categoryid = c.categoryid
    WHERE d.status = 'active'
  `);
  console.log("Active deals after JOINs:", joinedDeals.length);

  process.exit(0);
}
run();
