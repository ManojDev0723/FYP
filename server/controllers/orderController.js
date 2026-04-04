const db = require("../config/db");

// Helper to get businessid from userid
const getBusinessId = async (userId) => {
  const [businesses] = await db.query(
    "SELECT businessid FROM business WHERE ownerid = ?",
    [userId]
  );
  return businesses.length > 0 ? businesses[0].businessid : null;
};

// @desc    Get all orders/coupons for the logged-in merchant
// @route   GET /api/merchants/orders
// @access  Private (Merchant)
exports.getMerchantOrders = async (req, res) => {
  try {
    const businessid = await getBusinessId(req.userId);
    if (!businessid) {
      return res.status(404).json({ message: "Business not found for this merchant" });
    }

    // Unified query for orders and their coupon status
    const query = `
      SELECT 
        c.couponid, 
        c.couponcode, 
        c.redeemed, 
        c.redeemedat, 
        p.createdat as purchasedate, 
        p.quantity, 
        p.totalprice,
        d.title as dealTitle, 
        d.discountprice,
        u.fullname as customerName,
        CASE 
          WHEN c.redeemed = 1 THEN 'Redeemed'
          WHEN d.enddate < NOW() THEN 'Expired'
          ELSE 'Purchased'
        END as status
      FROM coupons c
      JOIN purchases p ON c.purchaseid = p.purchaseid
      JOIN deals d ON p.dealid = d.dealid
      JOIN users u ON p.userid = u.userid
      WHERE d.businessid = ?
      ORDER BY p.createdat DESC
    `;
    const [orders] = await db.query(query, [businessid]);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching merchant orders:", error);
    res.status(500).json({ message: "Server error fetching orders", error: error.message });
  }
};

// @desc    Create a pending purchase order for checkout
// @route   POST /orders/create
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { items, orderName } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required to create an order." });
    }

    const validItems = items.map((item) => ({
      dealid: Number(item.dealid),
      quantity: Number(item.quantity),
    })).filter((item) => item.dealid > 0 && item.quantity > 0);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "At least one cart item must have a valid deal ID and quantity." });
    }

    const dealIds = [...new Set(validItems.map((item) => item.dealid))];
    const placeholders = dealIds.map(() => "?").join(",");
    const [deals] = await db.query(
      `SELECT dealid, discountprice FROM deals WHERE dealid IN (${placeholders})`,
      dealIds
    );

    if (deals.length !== dealIds.length) {
      return res.status(400).json({ message: "One or more deals in the cart are invalid." });
    }

    const priceMap = new Map(deals.map((deal) => [deal.dealid, Number(deal.discountprice)]));
    let totalAmount = 0;
    let totalQuantity = 0;

    for (const item of validItems) {
      const price = priceMap.get(item.dealid);
      if (price == null) {
        return res.status(400).json({ message: `Deal not found: ${item.dealid}` });
      }
      totalAmount += price * item.quantity;
      totalQuantity += item.quantity;
    }

    const firstDealId = validItems[0].dealid;
    const [result] = await db.query(
      `INSERT INTO purchases (userid, dealid, quantity, totalamount, paymentstatus, paymentmethod) VALUES (?, ?, ?, ?, 'pending', 'online')`,
      [req.userId, firstDealId, totalQuantity, totalAmount]
    );

    res.status(201).json({
      success: true,
      orderId: result.insertId,
      totalAmount,
      orderName: orderName || `DealHub Order #${result.insertId}`,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error creating order", error: error.message });
  }
};

// @desc    Update coupon redeem status
// @route   PATCH /api/merchants/orders/:id/redeem
// @access  Private (Merchant)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { redeemed } = req.body; // true or false

    const businessid = await getBusinessId(req.userId);
    if (!businessid) {
      return res.status(404).json({ message: "Business not found for this merchant" });
    }

    // Verify this coupon belongs to the merchant's deals
    const [couponCheck] = await db.query(
      `SELECT c.couponid 
       FROM coupons c
       JOIN purchases p ON c.purchaseid = p.purchaseid
       JOIN deals d ON p.dealid = d.dealid
       WHERE c.couponid = ? AND d.businessid = ?`,
      [id, businessid]
    );

    if (couponCheck.length === 0) {
      return res.status(404).json({ message: "Coupon not found or unauthorized" });
    }

    const redeemedAt = redeemed ? new Date() : null;

    await db.query(
      `UPDATE coupons SET redeemed = ?, redeemedat = ? WHERE couponid = ?`,
      [redeemed ? 1 : 0, redeemedAt, id]
    );

    res.json({ message: `Coupon successfully marked as ${redeemed ? 'redeemed' : 'not redeemed'}` });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error updating order status" });
  }
};
