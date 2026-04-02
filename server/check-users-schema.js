require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'dealhub'
    });

    const [rows] = await connection.query('DESCRIBE users');
    fs.writeFileSync('users_schema_clean.txt', JSON.stringify(rows, null, 2), 'utf-8');
    console.log("Written to users_schema_clean.txt");

    await connection.end();
  } catch (error) {
    console.error("Error fetching schema:", error.message);
  }
}

checkSchema();
