const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const couponController = require("../controllers/couponController");
const orderController = require("../controllers/orderController");
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Get current merchant profile (Protected)
router.get("/profile", protect, merchantController.getMerchantProfile);

// Update merchant profile (Protected)
router.put("/profile", protect, merchantController.updateMerchantProfile);

// Get merchant orders/coupons
router.get("/orders", protect, orderController.getMerchantOrders);

// Update order/coupon redeem status
router.patch("/orders/:id/redeem", protect, orderController.updateOrderStatus);

// Get merchant reviews
router.get("/reviews", protect, reviewController.getMerchantReviews);

// Reply to a review
router.patch("/reviews/:id/reply", protect, reviewController.replyToReview);


module.exports = router;
