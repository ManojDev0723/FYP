const db = require("../config/db");

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
