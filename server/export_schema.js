require('dotenv').config();
const db = require('./config/db');
const fs = require('fs');

async function exportSchema() {
  const tables = ['coupons', 'purchases', 'deals', 'users', 'reviews'];
  const schema = {};
  for (const table of tables) {
    try {
      const [rows] = await db.query(`DESCRIBE ${table}`);
      schema[table] = rows;
    } catch (err) {
      console.error(`Error describing ${table}:`, err.message);
    }
  }
  fs.writeFileSync('schema_full.json', JSON.stringify(schema, null, 2));
  console.log('Schema exported to schema_full.json');
  process.exit(0);
}

exportSchema();
