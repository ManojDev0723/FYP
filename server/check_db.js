const db = require("./config/db");

async function checkDb() {
  try {
    const [users] = await db.query("SELECT userid, fullname, email, role FROM users");
    console.log("Users:", users);
    
    const [businesses] = await db.query("SELECT * FROM business");
    console.log("Businesses:", businesses);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
