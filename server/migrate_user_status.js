require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration...');

    // Add status column to users table if it doesn't exist
    const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "status"');
    if (columns.length === 0) {
      // Using an enum for status, defaulting to 'active'
      await db.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active' AFTER role");
      console.log('Added status column to users table.');
    } else {
      console.log('status column already exists.');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
