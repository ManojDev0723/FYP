require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Add last_login to admin table if it doesn't exist
    const [columns] = await db.query('SHOW COLUMNS FROM admin LIKE "last_login"');
    if (columns.length === 0) {
      await db.query('ALTER TABLE admin ADD COLUMN last_login DATETIME DEFAULT NULL');
      console.log('Added last_login column to admin table.');
    } else {
      console.log('last_login column already exists.');
    }

    // 2. Create admin_login_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_login_logs (
        logid INT AUTO_INCREMENT PRIMARY KEY,
        adminid INT NOT NULL,
        logintime DATETIME DEFAULT CURRENT_TIMESTAMP,
        ipaddress VARCHAR(45),
        useragent TEXT,
        FOREIGN KEY (adminid) REFERENCES admin(adminid) ON DELETE CASCADE
      )
    `);
    console.log('Ensured admin_login_logs table exists.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
