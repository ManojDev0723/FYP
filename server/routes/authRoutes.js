const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", authController.register);

// Register a new merchant
router.post("/merchant-register", authController.merchantRegister);

// Login a user
router.post("/login", authController.login);

// Login an admin
router.post("/admin-login", authController.adminLogin);

// Get current logged in user (Protected)
router.get("/me", protect, authController.getMe);

// Update user profile (Protected)
router.put("/profile", protect, authController.updateProfile);

module.exports = router;
