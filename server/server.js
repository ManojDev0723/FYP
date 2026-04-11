const express = require("express");
// Sanitized controller fix applied
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      // More robust path matching for Stripe webhook
      if (req.originalUrl.includes("/api/stripe/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/authRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const dealRoutes = require("./routes/dealRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const khaltiRoutes = require("./routes/khalti");
const stripeRoutes = require("./routes/stripe");


app.use("/api/auth", authRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/khalti", khaltiRoutes);
app.use("/api/stripe", stripeRoutes);


// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM deals LIMIT 1");
    res.json({ message: "Database Connected Successfully", data: rows });
  } catch (error) {
    console.error("DB TEST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});