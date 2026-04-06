const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/create", protect, orderController.createOrder);
router.get("/:id/coupons", protect, orderController.getOrderCoupons);

module.exports = router;
