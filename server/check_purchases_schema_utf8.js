require('dotenv').config();
const db = require('./config/db');
const fs = require('fs');

async function checkPurchases() {
  try {
    const [rows] = await db.query('DESCRIBE purchases');
    fs.writeFileSync('schema_purchases_utf8.txt', JSON.stringify(rows, null, 2), 'utf8');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPurchases();
