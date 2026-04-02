try {
  const dealController = require("./controllers/dealController");
  console.log("dealController loaded successfully");
  console.log("Exports:", Object.keys(dealController));
  
  const dealRoutes = require("./routes/dealRoutes");
  console.log("dealRoutes loaded successfully");
} catch (error) {
  console.error("Error loading files:", error);
}
