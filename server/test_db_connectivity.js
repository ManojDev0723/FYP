require("dotenv").config();
const mysql = require("mysql2/promise");

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("Database connection successful!");
    
    const [categories] = await connection.query("SELECT * FROM categories");
    console.log("Categories:", categories);

    const [deals] = await connection.query("SELECT * FROM deals");
    console.log("Total Deals count:", deals.length);
    
    const [activeHotels] = await connection.query(`
      SELECT d.*, c.name as category_name 
      FROM deals d
      LEFT JOIN categories c ON d.categoryid = c.categoryid
      WHERE LOWER(c.name) LIKE '%hotel%' AND d.status = 'active'
    `);
    console.log("Active Hotel Deals:", activeHotels.map(d => ({title: d.title, status: d.status, category: d.category_name})));
    
    if (activeHotels.length === 0) {
      console.log("NO ACTIVE HOTEL DEALS FOUND!");
      const [allHotels] = await connection.query(`
        SELECT d.*, c.name as category_name 
        FROM deals d
        LEFT JOIN categories c ON d.categoryid = c.categoryid
        WHERE LOWER(c.name) LIKE '%hotel%'
      `);
      console.log("All Hotel deals (including inactive):", allHotels.map(d => ({title: d.title, status: d.status})));
    }
    
    await connection.end();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

test();
