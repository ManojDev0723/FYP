const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin routes
router.get("/overview", protect, admin, adminController.getOverviewStats);
router.get("/profile", protect, admin, adminController.getAdminProfile);
router.put("/profile", protect, admin, adminController.updateAdminProfile);
router.put("/change-password", protect, admin, adminController.changeAdminPassword);
router.get("/logs", protect, admin, adminController.getAdminLogs);

// User Management routes
router.get("/users", protect, admin, adminController.getUsers);
router.get("/users/:id", protect, admin, adminController.getUserDetails);
router.put("/users/:id/status", protect, admin, adminController.toggleUserStatus);
// Deal Management routes
router.get("/deals", protect, admin, adminController.getAllDeals);
router.post("/deals", protect, admin, adminController.createDealAdmin);
router.put("/deals/:id", protect, admin, adminController.updateDealAdmin);
router.put("/deals/:id/status", protect, admin, adminController.toggleDealStatusAdmin);
router.delete("/deals/:id", protect, admin, adminController.deleteDealAdmin);

// Business Management
router.get("/businesses", protect, admin, adminController.getAllBusinessesAdmin);
router.post("/businesses", protect, admin, adminController.createBusinessAdmin);
router.put("/businesses/:id/status", protect, admin, adminController.updateBusinessStatusAdmin);
router.get("/businesses/simple", protect, admin, adminController.getAllBusinessesSimple);

module.exports = router;
