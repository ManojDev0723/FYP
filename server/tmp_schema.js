require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'dealhub'
    });

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables:');
    console.log(JSON.stringify(tables, null, 2));

    const [orders] = await connection.query('DESCRIBE orders').catch(() => [null]);
    if (orders) {
      console.log('Orders Table Schema:');
      console.log(JSON.stringify(orders, null, 2));
    }

    const [coupons] = await connection.query('DESCRIBE coupons').catch(() => [null]);
    if (coupons) {
      console.log('Coupons Table Schema:');
      console.log(JSON.stringify(coupons, null, 2));
    }

    await connection.end();
  } catch (error) {
    console.error("Error fetching schema:", error.message);
  }
}

checkTables();
