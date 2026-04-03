const db = require("../config/db");

// @desc    Get deals for a specific merchant
// @route   GET /api/deals/merchant
// @access  Private (Merchant)
exports.getMerchantDeals = async (req, res) => {
  try {
    // 1. Find the businessid for this user
    const [businesses] = await db.query(
      "SELECT businessid FROM business WHERE ownerid = ?",
      [req.userId]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ message: "Merchant business not found" });
    }

    const businessid = businesses[0].businessid;

    // 2. Fetch all deals for this business
    const [deals] = await db.query(
      `SELECT d.*, c.name as category_name 
       FROM deals d
       LEFT JOIN categories c ON d.categoryid = c.categoryid
       WHERE d.businessid = ? 
       ORDER BY d.createdat DESC`,
      [businessid]
    );

    res.json(deals);
  } catch (error) {
    console.error("Error fetching merchant deals:", error);
    res.status(500).json({ message: "Server error fetching deals" });
  }
};

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Private (Merchant)
exports.createDeal = async (req, res) => {
  try {
    const { 
      title, description, originalprice, discountprice, 
      startdate, enddate, quantityavailable, imageurl, categoryid 
    } = req.body;

    // 1. Find the businessid for this user
    const [businesses] = await db.query(
      "SELECT businessid, verified FROM business WHERE ownerid = ?",
      [req.userId]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ message: "Merchant business not found" });
    }

    const { businessid, verified } = businesses[0];

    // Optional: Check if merchant is verified before allowing deal creation
    // if (!verified) {
    //   return res.status(403).json({ message: "Your business must be verified before you can create deals." });
    // }

    // 2. Insert the new deal
    const [result] = await db.query(
      `INSERT INTO deals (businessid, categoryid, title, description, originalprice, discountprice, startdate, enddate, quantityavailable, imageurl, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inactive')`,
      [businessid, categoryid || 1, title, description, originalprice, discountprice, startdate, enddate, quantityavailable, imageurl]
    );

    res.status(201).json({ 
      message: "Deal created successfully and pending review.", 
      dealid: result.insertId 
    });
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(500).json({ message: "Server error creating deal" });
  }
};

// @desc    Update an existing deal
// @route   PUT /api/deals/:id
// @access  Private (Merchant)
exports.updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, originalprice, discountprice, 
      startdate, enddate, quantityavailable, imageurl, categoryid 
    } = req.body;

    // 1. Verify deal belongs to this merchant
    const [dealCheck] = await db.query(
      `SELECT d.dealid FROM deals d 
       JOIN business b ON d.businessid = b.businessid 
       WHERE d.dealid = ? AND b.ownerid = ?`,
      [id, req.userId]
    );

    if (dealCheck.length === 0) {
      return res.status(404).json({ message: "Deal not found or unauthorized" });
    }

    // 2. Update the deal
    await db.query(
      `UPDATE deals SET 
        title = ?, description = ?, originalprice = ?, discountprice = ?, 
        startdate = ?, enddate = ?, quantityavailable = ?, imageurl = ?, categoryid = ?
       WHERE dealid = ?`,
      [title, description, originalprice, discountprice, startdate, enddate, quantityavailable, imageurl, categoryid, id]
    );

    res.json({ message: "Deal updated successfully" });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ message: "Server error updating deal" });
  }
};

// @desc    Toggle deal status (Active/Inactive)
// @route   PATCH /api/deals/:id/status
// @access  Private (Merchant)
exports.toggleDealStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get current status and verify ownership
    const [deals] = await db.query(
      `SELECT d.dealid, d.status FROM deals d 
       JOIN business b ON d.businessid = b.businessid 
       WHERE d.dealid = ? AND b.ownerid = ?`,
      [id, req.userId]
    );

    if (deals.length === 0) {
      return res.status(404).json({ message: "Deal not found or unauthorized" });
    }

    const currentStatus = deals[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // 2. Update status
    await db.query("UPDATE deals SET status = ? WHERE dealid = ?", [newStatus, id]);

    res.json({ message: `Deal status updated to ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error("Error toggling deal status:", error);
    res.status(500).json({ message: "Server error updating deal status" });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private (Merchant)
exports.deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify ownership
    const [dealCheck] = await db.query(
      `SELECT d.dealid FROM deals d 
       JOIN business b ON d.businessid = b.businessid 
       WHERE d.dealid = ? AND b.ownerid = ?`,
      [id, req.userId]
    );

    if (dealCheck.length === 0) {
      return res.status(404).json({ message: "Deal not found or unauthorized" });
    }

    // 2. Delete the deal
    await db.query("DELETE FROM deals WHERE dealid = ?", [id]);

    res.json({ message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({ message: "Server error deleting deal" });
  }
};

// @desc    Get public deals for customers
// @route   GET /api/deals
// @access  Public
exports.getDeals = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, b.businessname as business_name, c.name as category_name 
      FROM deals d
      JOIN business b ON d.businessid = b.businessid
      JOIN categories c ON d.categoryid = c.categoryid
      WHERE d.status = 'active'
      ORDER BY d.createdat DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching public deals:", err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get a single deal by ID
// @route   GET /api/deals/:id
// @access  Public
exports.getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deal] = await db.query(`
      SELECT d.*, b.businessname as business_name, b.phone, b.address, c.name as category_name 
      FROM deals d
      JOIN business b ON d.businessid = b.businessid
      JOIN categories c ON d.categoryid = c.categoryid
      WHERE d.dealid = ? AND d.status = 'active'
    `, [id]);

    if (!deal || deal.length === 0) {
      return res.status(404).json({ message: "Deal not found or inactive" });
    }

    // Get average rating for the deal
    const [ratings] = await db.query(`
      SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount
      FROM reviews
      WHERE dealid = ?
    `, [id]);

    const result = {
      ...deal[0],
      avgRating: parseFloat(ratings[0].avgRating) || 0,
      reviewCount: ratings[0].reviewCount || 0
    };

    res.json(result);
  } catch (err) {
    console.error("Error fetching deal by ID:", err);
    res.status(500).json({ error: err.message });
  }
};