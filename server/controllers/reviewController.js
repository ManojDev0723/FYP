const db = require("../config/db");

// Get all reviews for a merchant's deals
const getMerchantReviews = async (req, res) => {
  try {
    // req.userId is the ownerid in the business table
    const [reviews] = await db.query(
      `SELECT r.*, u.fullname as customerName, d.title as dealTitle
       FROM reviews r
       JOIN deals d ON r.dealid = d.dealid
       JOIN users u ON r.userid = u.userid
       WHERE d.businessid = (SELECT businessid FROM business WHERE ownerid = ?)
       ORDER BY r.createdat DESC`,
      [req.userId]
    );

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching merchant reviews:", error);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
};

// Reply to a review
const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    // Verify the review belongs to the merchant's deal before updating
    const [reviewCheck] = await db.query(
      `SELECT r.reviewid 
       FROM reviews r
       JOIN deals d ON r.dealid = d.dealid
       WHERE r.reviewid = ? AND d.businessid = (SELECT businessid FROM business WHERE ownerid = ?)`,
      [id, req.userId]
    );

    if (reviewCheck.length === 0) {
      return res.status(403).json({ message: "You are not authorized to reply to this review" });
    }

    await db.query("UPDATE reviews SET merchant_reply = ? WHERE reviewid = ?", [reply, id]);

    res.json({ message: "Reply submitted successfully" });
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({ message: "Server error during reply submission" });
  }
};

module.exports = {
  getMerchantReviews,
  replyToReview,
};
