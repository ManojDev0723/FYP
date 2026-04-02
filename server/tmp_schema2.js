require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'dealhub'
    });

    const [tables] = await connection.query('SHOW TABLES');
    fs.writeFileSync('db_tables.json', JSON.stringify(tables, null, 2));

    try {
      const [orders] = await connection.query('DESCRIBE orders');
      fs.writeFileSync('db_orders.json', JSON.stringify(orders, null, 2));
    } catch(e) {}

    try {
      const [coupons] = await connection.query('DESCRIBE coupons');
      fs.writeFileSync('db_coupons.json', JSON.stringify(coupons, null, 2));
    } catch(e) {}

    await connection.end();
  } catch (error) {
    console.error("Error fetching schema:", error.message);
  }
}

checkTables();
