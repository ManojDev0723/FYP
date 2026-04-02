require("dotenv").config();
const db = require("./config/db");
async function run() {
  const [all] = await db.query("SELECT COUNT(*) as c FROM deals");
  const [active] = await db.query("SELECT COUNT(*) as c FROM deals WHERE status = 'active'");
  const [joined] = await db.query(`
    SELECT COUNT(*) as c
    FROM deals d
    JOIN business b ON d.businessid = b.businessid
    JOIN categories c ON d.categoryid = c.categoryid
    WHERE d.status = 'active'
  `);
  console.log(`ALL: ${all[0].c}, ACTIVE: ${active[0].c}, JOINED: ${joined[0].c}`);
  process.exit(0);
}
run();
