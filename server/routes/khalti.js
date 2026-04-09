const express = require("express");
const axios = require("axios");
const db = require("../config/db");
const { generateCoupons } = require("../controllers/couponController");
const router = express.Router();

const KHALTI_API = "https://dev.khalti.com/api/v2/epayment";
const SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const BASE_URL = process.env.BASE_URL;
const CLIENT_URL = process.env.CLIENT_URL;

const buildKhaltiHeaders = () => ({
  Authorization: `Key ${SECRET_KEY}`,
  "Content-Type": "application/json",
});

const ensureEnv = () => {
  if (!SECRET_KEY || !BASE_URL || !CLIENT_URL) {
    throw new Error("KHALTI_SECRET_KEY, BASE_URL, and CLIENT_URL must be set in .env");
  }
};

// ─────────────────────────────────────────
// STEP 1: Initiate Payment
// ─────────────────────────────────────────
router.post("/initiate", async (req, res) => {
  try {
    ensureEnv();

    const { orderId, orderName, name, email, phone } = req.body;

    if (!orderId || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "orderId, name, email, and phone are required.",
      });
    }

    // ✅ Recalculate amount from DB — never trust frontend
    const [purchases] = await db.query(
      "SELECT purchaseid, totalamount FROM purchases WHERE purchaseid = ?",
      [orderId]
    );

    if (purchases.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const purchase = purchases[0];
    const totalAmount = Number(purchase.totalamount);

    if (Number.isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order amount." });
    }

    const response = await axios.post(
      `${KHALTI_API}/initiate/`,
      {
        // ✅ return_url must point to BACKEND — Khalti will send pidx here
        return_url: `${BASE_URL}/api/khalti/verify`,
        website_url: CLIENT_URL,
        amount: Math.round(totalAmount * 100), // Rs to paisa
        purchase_order_id: String(orderId),
        purchase_order_name: orderName || `DealHub Order #${orderId}`,
        customer_info: { name, email, phone },
      },
      { 
        headers: buildKhaltiHeaders(),
        timeout: 15000 // 15 second timeout
      }
    );

    return res.json({
      success: true,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });

  } catch (error) {
    console.error("Khalti initiate error:", error.message);
    
    // Handle network timeout errors
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(503).json({
        success: false,
        message: "Payment service is temporarily unavailable. Please try again in a moment.",
        error: "Connection timeout to payment gateway"
      });
    }
    
    const payload = error?.response?.data || error.message;
    return res.status(error?.response?.status || 500).json({
      success: false,
      message: payload || "Failed to initiate payment",
    });
  }
});

// ─────────────────────────────────────────
// STEP 2: Verify Payment (Khalti Callback)
// ─────────────────────────────────────────
router.get("/verify", async (req, res) => {
  try {
    ensureEnv();

    // ✅ FIX: Read BOTH pidx AND purchase_order_id from req.query
    // Khalti sends these automatically in the return_url callback
    const { pidx, purchase_order_id } = req.query;

    console.log("Khalti callback received:", req.query); // helpful for debugging

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Missing pidx in callback.",
      });
    }

    if (!purchase_order_id) {
      return res.status(400).json({
        success: false,
        message: "Missing purchase_order_id in callback.",
      });
    }

    // ✅ Call Khalti Lookup API to verify payment status
    const response = await axios.post(
      `${KHALTI_API}/lookup/`,
      { pidx },
      { 
        headers: buildKhaltiHeaders(),
        timeout: 15000 // 15 second timeout
      }
    );

    const paymentData = response.data;
    console.log("Khalti lookup response:", paymentData);

    // ✅ Verify the order exists in our DB
    const [purchases] = await db.query(
      "SELECT purchaseid, totalamount, paymentstatus FROM purchases WHERE purchaseid = ?",
      [purchase_order_id]
    );

    if (purchases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found in database.",
      });
    }

    const purchase = purchases[0];

    // ✅ Guard: prevent double processing
    if (purchase.paymentstatus === "completed") {
      return res.redirect(
        `${CLIENT_URL}/payment-success?orderId=${purchase_order_id}`
      );
    }

    if (paymentData.status === "Completed") {
      // ✅ Update purchase record payment status
      await db.query(
        `UPDATE purchases 
         SET paymentstatus = 'completed'
         WHERE purchaseid = ?`,
        [purchase_order_id]
      );

      // ✅ Generate Coupons for each item in the order
      try {
        await generateCoupons(purchase_order_id);
      } catch (couponError) {
        console.error("Coupon generation failed after payment success:", couponError);
        // Note: Payment is successful, so we still proceed, but log the error
      }

      return res.redirect(
        `${CLIENT_URL}/payment-success?orderId=${purchase_order_id}`
      );

    } else {
      // ❌ Payment failed or cancelled
      await db.query(
        `UPDATE purchases 
         SET paymentstatus = 'failed'
         WHERE purchaseid = ?`,
        [purchase_order_id]
      );

      return res.redirect(
        `${CLIENT_URL}/payment-failed?reason=${encodeURIComponent(
          paymentData.status || "failed"
        )}`
      );
    }

  } catch (error) {
    console.error("Khalti verify error:", error.message);
    
    // Handle network timeout errors
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.redirect(
        `${CLIENT_URL}/payment-failed?reason=${encodeURIComponent(
          'Payment verification timeout - please contact support'
        )}`
      );
    }
    
    const payload = error?.response?.data || error.message;
    return res.status(error?.response?.status || 500).json({
      success: false,
      message: payload || "Payment verification failed",
    });
  }
});

module.exports = router;