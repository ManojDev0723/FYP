require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Check if column already exists
    const [columns] = await db.query('SHOW COLUMNS FROM reviews LIKE "merchant_reply"');
    if (columns.length > 0) {
      console.log('Column "merchant_reply" already exists.');
    } else {
      await db.query('ALTER TABLE reviews ADD COLUMN merchant_reply TEXT DEFAULT NULL');
      console.log('Column "merchant_reply" added successfully.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
