const db = require("./config/db");

async function checkCoupons() {
  try {
    const [rows] = await db.query("DESCRIBE coupons");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkCoupons();
