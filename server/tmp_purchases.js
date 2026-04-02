require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'dealhub'
  });

  const [purchases] = await connection.query('DESCRIBE purchases');
  fs.writeFileSync('db_purchases.json', JSON.stringify(purchases, null, 2));

  await connection.end();
}

checkTables();
