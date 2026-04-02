const express = require("express");
const router = express.Router();
const { 
  getDeals, 
  getMerchantDeals, 
  createDeal, 
  updateDeal, 
  toggleDealStatus, 
  deleteDeal 
} = require("../controllers/dealController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Public route
router.get("/", getDeals);

// Upload route (protected)
router.post("/upload", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Protected Merchant routes
router.get("/merchant", protect, getMerchantDeals);
router.post("/", protect, createDeal);
router.put("/:id", protect, updateDeal);
router.patch("/:id/status", protect, toggleDealStatus);
router.delete("/:id", protect, deleteDeal);

module.exports = router;