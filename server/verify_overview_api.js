require("dotenv").config();
const db = require("./config/db");
const adminController = require("./controllers/adminController");

async function verifyOverview() {
  const req = {
    userId: 1 // Mock userId
  };
  const res = {
    json: (data) => {
      console.log("SUCCESS:", JSON.stringify(data, null, 2));
      process.exit(0);
    },
    status: (code) => ({
      json: (data) => {
        console.error("ERROR CODE:", code);
        console.error("ERROR DATA:", JSON.stringify(data, null, 2));
        process.exit(1);
      }
    })
  };

  try {
    // Override console.error to see backend logs
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError("BACKEND ERROR:", ...args);
    };
    
    await adminController.getOverviewStats(req, res);
  } catch (err) {
    console.error("UNCAUGHT ERROR:", err);
    process.exit(1);
  }
}

verifyOverview();
