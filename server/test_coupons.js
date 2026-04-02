require("dotenv").config();
const db = require("./config/db");


async function testCoupons() {
  try {
    const userId = 2; // Assuming merchant user id is 2 for testing, adjust as needed
    const query = `
      SELECT 
        c.couponid, 
        c.couponcode, 
        c.redeemed, 
        c.redeemedat, 
        p.purchasedate, 
        p.quantity, 
        d.title as dealTitle, 
        u.fullName as customerName
      FROM coupons c
      JOIN purchases p ON c.purchaseid = p.purchaseid
      JOIN deals d ON p.dealid = d.dealid
      JOIN users u ON p.userid = u.userid
      ORDER BY p.purchasedate DESC
      LIMIT 5
    `;
    const [coupons] = await db.query(query);
    console.log("Coupons:", JSON.stringify(coupons, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testCoupons();
