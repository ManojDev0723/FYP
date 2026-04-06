require("dotenv").config();
const { generateCoupons } = require("./controllers/couponController");

async function testGeneration() {
  try {
    const purchaseId = 6; // Using an existing purchase ID
    console.log(`Testing coupon generation for Purchase ID: ${purchaseId}`);
    
    const codes = await generateCoupons(purchaseId);
    
    console.log("Generated Codes:", codes);
    console.log("Success!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testGeneration();
