const db = require("../config/db");
const crypto = require("crypto");

// Helper to get businessid from userid (similar to dealController)
const getBusinessId = async (userId) => {
  const [businesses] = await db.query(
    "SELECT businessid FROM business WHERE ownerid = ?",
    [userId]
  );
  return businesses.length > 0 ? businesses[0].businessid : null;
};

// @desc    Get all coupons for the logged-in merchant
// @route   GET /api/merchants/coupons
// @access  Private (Merchant)
exports.getMerchantCoupons = async (req, res) => {
  try {
    const businessid = await getBusinessId(req.userId);
    if (!businessid) {
      return res.status(404).json({ message: "Business not found for this merchant" });
    }

    const query = `
      SELECT 
        c.couponid, 
        c.couponcode, 
        c.redeemed, 
        c.redeemedat, 
        p.purchasedate, 
        p.quantity, 
        d.title as dealTitle, 
        u.fullName as customerName
      FROM coupons c
      JOIN purchases p ON c.purchaseid = p.purchaseid
      JOIN deals d ON p.dealid = d.dealid
      JOIN users u ON p.userid = u.userid
      WHERE d.businessid = ?
      ORDER BY p.purchasedate DESC
    `;
    const [coupons] = await db.query(query, [businessid]);
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching merchant coupons:", error);
    res.status(500).json({ message: "Server error fetching coupons" });
  }
};

// @desc    Update coupon redeem status
// @route   PATCH /api/merchants/coupons/:id/redeem
// @access  Private (Merchant)
exports.updateCouponStatus = async (req, res) => {
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
    console.error("Error updating coupon status:", error);
    res.status(500).json({ message: "Server error updating coupon status" });
  }
};

// @desc    Generate unique coupons for each item in an order
// @access  Internal (called after payment verification)
exports.generateCoupons = async (orderId) => {
  try {
    // 1. Fetch order details from purchases joined with deals
    const query = `
      SELECT p.userid, p.dealid, p.quantity, d.businessid as merchantid, d.enddate as expiresat
      FROM purchases p
      JOIN deals d ON p.dealid = d.dealid
      WHERE p.purchaseid = ?
    `;
    const [orders] = await db.query(query, [orderId]);

    if (orders.length === 0) {
      throw new Error(`Order #${orderId} not found.`);
    }

    const order = orders[0];
    const generatedCodes = [];

    // Helper to generate 10-char alphanumeric code
    const generateCode = () => crypto.randomBytes(5).toString("hex").toUpperCase();

    // 2. Generate logic (one coupon per quantity unit)
    for (let i = 0; i < order.quantity; i++) {
      const couponCode = generateCode();

      await db.query(
        `INSERT INTO coupons 
         (purchaseid, couponcode, userid, dealid, merchantid, status, expiresat) 
         VALUES (?, ?, ?, ?, ?, 'unused', ?)`,
        [orderId, couponCode, order.userid, order.dealid, order.merchantid, order.expiresat]
      );

      generatedCodes.push(couponCode);
    }

    console.log(`Successfully generated ${generatedCodes.length} coupons for order ID: ${orderId}`);
    return generatedCodes;
  } catch (error) {
    console.error("Critical error in generateCoupons:", error);
    throw error;
  }
};
