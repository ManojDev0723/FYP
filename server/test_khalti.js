const axios = require("axios");
const db = require("./config/db");

async function run() {
  try {
    const [purchases] = await db.query("SELECT purchaseid FROM purchases ORDER BY purchaseid DESC LIMIT 1");
    if (purchases.length === 0) return console.log("No purchases found.");
    
    const maxId = purchases[0].purchaseid;
    console.log("Testing with orderId:", maxId);
    
    const res = await axios.post("http://localhost:5000/api/khalti/initiate", {
      orderId: maxId,
      orderName: "Test Order",
      name: "John Doe",
      email: "test@example.com",
      phone: "9800000000"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
    console.log("Message:", err.message);
  }
  process.exit();
}

run();
