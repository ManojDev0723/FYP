const express = require("express");
const Stripe = require("stripe");
const db = require("../config/db");
const { generateCoupons } = require("../controllers/couponController");
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URL = process.env.CLIENT_URL;

// Initiate Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    // Recalculate amount from DB
    const [purchases] = await db.query(
      "SELECT purchaseid, totalamount FROM purchases WHERE purchaseid = ?",
      [orderId]
    );

    if (purchases.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const purchase = purchases[0];
    const totalAmount = Number(purchase.totalamount);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "npr", // Or your preferred currency
            product_data: {
              name: `DealHub Order #${orderId}`,
            },
            unit_amount: Math.round(totalAmount * 100), // In cents/paisa
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${CLIENT_URL}/payment-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment-failed?orderId=${orderId}`,
      metadata: {
        orderId: String(orderId),
      },
    });

    console.log(`Stripe Session Created for Order #${orderId}:`, session.id);
    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Webhook for payment verification
router.post("/webhook", async (req, res) => {
  console.log("Stripe Webhook Received...");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Stripe Webhook Verified. Event Type:", event.type);
  } catch (err) {
    console.error("Webhook Signature Error:", err.message);
    if (!req.rawBody) {
      console.error("CRITICAL: req.rawBody is MISSING. Check server.js middleware.");
    }
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    console.log("Processing completed session for Order ID:", orderId);

    try {
      // Verify payment status in DB first to avoid double processing
      const [purchases] = await db.query(
        "SELECT paymentstatus FROM purchases WHERE purchaseid = ?",
        [orderId]
      );

      if (purchases.length > 0 && purchases[0].paymentstatus !== "completed") {
        await db.query(
          "UPDATE purchases SET paymentstatus = 'completed' WHERE purchaseid = ?",
          [orderId]
        );
        await generateCoupons(orderId);
        console.log(`Order ${orderId} finalized via Stripe Webhook.`);
      } else {
        console.log(`Order ${orderId} skipped (maybe already completed or not found). Status:`, purchases[0]?.paymentstatus);
      }
    } catch (dbError) {
      console.error("Database error in Stripe Webhook:", dbError);
      return res.status(500).send("Internal Server Error");
    }
  }

  res.json({ received: true });
});

module.exports = router;
