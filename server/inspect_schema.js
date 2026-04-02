require('dotenv').config();
const db = require('./config/db');

async function inspectSchema() {
  const tables = ['business'];
  for (const table of tables) {
    try {
      const [rows] = await db.query(`DESCRIBE ${table}`);
      console.log(`--- Schema for ${table} ---`);
      console.log(rows.map(r => `${r.Field}: ${r.Type}`).join('\n'));
    } catch (err) {
      console.error(`Error describing ${table}:`, err.message);
    }
  }
  process.exit(0);
}

inspectSchema();
