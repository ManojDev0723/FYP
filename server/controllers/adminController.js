const db = require("../config/db");
const bcrypt = require("bcrypt");

// @desc    Get Admin Dashboard Overview statistics
// @route   GET /api/admin/overview
// @access  Private (Admin)
exports.getOverviewStats = async (req, res) => {
  try {
    // 1. Fetch Summary Statistics
    const [activeDeals] = await db.query("SELECT COUNT(*) as count FROM deals WHERE status = 'active'");
    const [revenue] = await db.query("SELECT SUM(totalamount) as total FROM purchases WHERE paymentstatus = 'completed'");
    const [users] = await db.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
    const [pendingApprovals] = await db.query("SELECT COUNT(*) as count FROM deals WHERE status = 'inactive'");

    const stats = {
      totalActiveDeals: activeDeals[0].count,
      totalRevenue: Number(revenue[0].total || 0),
      totalUsers: users[0].count,
      totalPendingApprovals: pendingApprovals[0].count
    };

    // 2. Fetch Chart Data
    // Revenue breakdown by category
    const [revenueByCategory] = await db.query(`
      SELECT c.name as category, SUM(p.totalamount) as revenue
      FROM purchases p
      JOIN deals d ON p.dealid = d.dealid
      JOIN categories c ON d.categoryid = c.categoryid
      WHERE p.paymentstatus = 'completed'
      GROUP BY c.name
    `);

    // Payment method distribution
    const [paymentMethodBreakdown] = await db.query(`
      SELECT paymentmethod, COUNT(*) as count
      FROM purchases
      GROUP BY paymentmethod
    `);

    const charts = {
      revenueByCategory,
      paymentMethodBreakdown
    };

    // 3. Fetch Recent Activity
    // Combining latest users, deals, reviews, and purchases
    const [recentUsers] = await db.query("SELECT 'user' as type, fullname as title, createdat as date FROM users ORDER BY createdat DESC LIMIT 5");
    const [recentDeals] = await db.query("SELECT 'deal' as type, title, createdat as date FROM deals ORDER BY createdat DESC LIMIT 5");
    const [recentReviews] = await db.query("SELECT 'review' as type, LEFT(comment, 50) as title, createdat as date FROM reviews ORDER BY createdat DESC LIMIT 5");
    const [recentPurchases] = await db.query(`
      SELECT 'purchase' as type, CONCAT('Purchase of ', d.title) as title, p.purchasedat as date 
      FROM purchases p 
      JOIN deals d ON p.dealid = d.dealid 
      ORDER BY p.purchasedat DESC LIMIT 5
    `);

    // Combine and sort by date descending
    const recentActivity = [...recentUsers, ...recentDeals, ...recentReviews, ...recentPurchases]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      success: true,
      stats,
      charts,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching admin overview stats:", error);
    res.status(500).json({ success: false, message: "Server error fetching overview stats" });
  }
};

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
exports.getAdminProfile = async (req, res) => {
  try {
    const [admins] = await db.query(
      "SELECT adminid, username, email, last_login, createdat FROM admin WHERE adminid = ?",
      [req.userId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, admin: admins[0] });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: "Username and email are required" });
    }

    await db.query(
      "UPDATE admin SET username = ?, email = ? WHERE adminid = ?",
      [username, email, req.userId]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
};

// @desc    Change Admin Password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new passwords are required" });
    }

    // Get current admin
    const [admins] = await db.query("SELECT * FROM admin WHERE adminid = ?", [req.userId]);
    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const admin = admins[0];

    // Verify current password (handle both plain and hashed)
    let isMatch = false;
    if (admin.passwordhash.startsWith('$2b$') || admin.passwordhash.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(currentPassword, admin.passwordhash);
    } else {
      isMatch = (currentPassword === admin.passwordhash);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query("UPDATE admin SET passwordhash = ? WHERE adminid = ?", [hashedNewPassword, req.userId]);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing admin password:", error);
    res.status(500).json({ success: false, message: "Server error changing password" });
  }
};

// @desc    Get Admin Login Logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getAdminLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      "SELECT logid, logintime, ipaddress, useragent FROM admin_login_logs WHERE adminid = ? ORDER BY logintime DESC LIMIT 20",
      [req.userId]
    );

    res.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    res.status(500).json({ success: false, message: "Server error fetching logs" });
  }
};

// @desc    Get All Users (with search and filter)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = "SELECT userid, fullname, email, role, status, createdat FROM users WHERE role != 'admin'";
    let params = [];

    if (role && role !== 'all') {
      query += " AND role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND (fullname LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY createdat DESC";

    const [users] = await db.query(query, params);
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
};

// @desc    Get User Dashboard Details (Profile + Purchases + Reviews)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Get User Profile
    const [users] = await db.query(
      "SELECT userid, fullname, email, phone, role, status, createdat FROM users WHERE userid = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userProfile = users[0];

    // 2. Get Purchase History
    const [purchases] = await db.query(`
      SELECT p.purchaseid, p.totalamount, p.quantity, p.paymentstatus, p.purchasedat, d.title as dealTitle
      FROM purchases p
      JOIN deals d ON p.dealid = d.dealid
      WHERE p.userid = ?
      ORDER BY p.purchasedat DESC
    `, [userId]);

    // 3. Get Reviews written by user
    const [reviews] = await db.query(`
      SELECT r.reviewid, r.rating, r.comment, r.createdat, d.title as dealTitle
      FROM reviews r
      JOIN deals d ON r.dealid = d.dealid
      WHERE r.userid = ?
      ORDER BY r.createdat DESC
    `, [userId]);

    // 4. Get Summary Stats
    const totalSpent = purchases.reduce((sum, p) => p.paymentstatus === 'completed' ? sum + Number(p.totalamount) : sum, 0);

    res.json({
      success: true,
      profile: userProfile,
      purchases,
      reviews,
      stats: {
        totalOrders: purchases.length,
        totalSpent,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Server error fetching user details" });
  }
};

// @desc    Update User Status (Toggle Active/Suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    await db.query("UPDATE users SET status = ? WHERE userid = ?", [status, userId]);

    res.json({ success: true, message: `User account has been ${status === 'active' ? 'activated' : 'suspended'}` });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
};

// @desc    Get All Deals (Admin)
// @route   GET /api/admin/deals
// @access  Private (Admin)
exports.getAllDeals = async (req, res) => {
  try {
    const [deals] = await db.query(`
      SELECT d.*, b.businessname as business_name, c.name as category_name
      FROM deals d
      LEFT JOIN business b ON d.businessid = b.businessid
      LEFT JOIN categories c ON d.categoryid = c.categoryid
      ORDER BY d.createdat DESC
    `);
    res.json({ success: true, deals });
  } catch (error) {
    console.error("Error fetching all deals:", error);
    res.status(500).json({ success: false, message: "Server error fetching deals" });
  }
};

// @desc    Create Deal (Admin)
// @route   POST /api/admin/deals
// @access  Private (Admin)
exports.createDealAdmin = async (req, res) => {
  try {
    const { 
      businessid, categoryid, title, description, originalprice, 
      discountprice, startdate, enddate, quantityavailable, imageurl, status 
    } = req.body;

    if (!businessid) {
      return res.status(400).json({ success: false, message: "Business ID is required" });
    }

    const [result] = await db.query(
      `INSERT INTO deals (businessid, categoryid, title, description, originalprice, discountprice, startdate, enddate, quantityavailable, imageurl, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessid, categoryid || 1, title, description, originalprice, discountprice, startdate, enddate, quantityavailable, imageurl, status || 'active']
    );

    res.status(201).json({ success: true, message: "Deal created successfully", dealid: result.insertId });
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(500).json({ success: false, message: "Server error creating deal" });
  }
};

// @desc    Update Deal (Admin)
// @route   PUT /api/admin/deals/:id
// @access  Private (Admin)
exports.updateDealAdmin = async (req, res) => {
  try {
    const { 
      businessid, categoryid, title, description, originalprice, 
      discountprice, startdate, enddate, quantityavailable, imageurl, status 
    } = req.body;
    const { id } = req.params;

    await db.query(
      `UPDATE deals SET businessid = ?, categoryid = ?, title = ?, description = ?, originalprice = ?, discountprice = ?, 
       startdate = ?, enddate = ?, quantityavailable = ?, imageurl = ?, status = ? 
       WHERE dealid = ?`,
      [businessid, categoryid || 1, title, description, originalprice, discountprice, startdate, enddate, quantityavailable, imageurl, status || 'active', id]
    );

    res.json({ success: true, message: "Deal updated successfully" });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ success: false, message: "Server error updating deal" });
  }
};

// @desc    Toggle Deal Status (Admin)
// @route   PUT /api/admin/deals/:id/status
// @access  Private (Admin)
exports.toggleDealStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query("UPDATE deals SET status = ? WHERE dealid = ?", [status, id]);

    res.json({ success: true, message: `Deal status updated to ${status}` });
  } catch (error) {
    console.error("Error toggling deal status:", error);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
};

// @desc    Delete Deal (Admin)
// @route   DELETE /api/admin/deals/:id
// @access  Private (Admin)
exports.deleteDealAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM deals WHERE dealid = ?", [id]);
    res.json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({ success: false, message: "Server error deleting deal" });
  }
};

// @desc    Get Simple Business List (Admin Dropdown)
// @route   GET /api/admin/businesses/simple
// @access  Private (Admin)
exports.getAllBusinessesSimple = async (req, res) => {
  try {
    const [businesses] = await db.query("SELECT businessid, businessname FROM business");
    res.json({ success: true, businesses });
  } catch (error) {
    console.error("Error fetching simple businesses:", error);
    res.status(500).json({ success: false, message: "Server error fetching businesses" });
  }
};

// @desc    Get All Businesses Detailed (Admin)
// @route   GET /api/admin/businesses
// @access  Private (Admin)
exports.getAllBusinessesAdmin = async (req, res) => {
  try {
    const [businesses] = await db.query(`
      SELECT 
        b.businessid, b.businessname, b.fullName, b.email, b.phone, b.verified, b.status, b.createdat,
        (SELECT COUNT(*) FROM deals d WHERE d.businessid = b.businessid) as deals_posted
      FROM business b
      ORDER BY b.createdat DESC
    `);
    
    // Compute statuses
    const formattedBusinesses = businesses.map(b => {
      let computed_status = 'unverified';
      if (b.status === 'suspended') {
        computed_status = 'suspended';
      } else if (b.verified === 1 && b.status === 'active') {
        computed_status = 'verified';
      }
      
      return {
        ...b,
        computed_status
      };
    });

    res.json({ success: true, businesses: formattedBusinesses });
  } catch (error) {
    console.error("Error fetching admin businesses:", error);
    res.status(500).json({ success: false, message: "Server error fetching businesses" });
  }
};

// @desc    Update Business Verification/Status (Admin)
// @route   PUT /api/admin/businesses/:id/status
// @access  Private (Admin)
exports.updateBusinessStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'verify', 'suspend', 'activate'

    if (action === 'verify') {
      await db.query("UPDATE business SET verified = 1, status = 'active' WHERE businessid = ?", [id]);
    } else if (action === 'suspend') {
      await db.query("UPDATE business SET status = 'suspended' WHERE businessid = ?", [id]);
    } else if (action === 'activate' || action === 'unverified') {
      await db.query("UPDATE business SET status = 'active' WHERE businessid = ?", [id]);
    }

    res.json({ success: true, message: `Business status updated to ${action}` });
  } catch (error) {
    console.error("Error updating business status:", error);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
};

// @desc    Create new Business and Merchant Owner (Admin)
// @route   POST /api/admin/businesses
// @access  Private (Admin)
exports.createBusinessAdmin = async (req, res) => {
  try {
    const { 
      businessname, fullName, email, phone, address, description, password 
    } = req.body;

    if (!businessname || !fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    // Check if user already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "A user with this email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordhash = await bcrypt.hash(password, salt);

    // Create User (merchant owner)
    const [userResult] = await db.query(
      "INSERT INTO users (fullname, email, passwordhash, phone, role, status) VALUES (?, ?, ?, ?, 'merchant', 'active')",
      [fullName, email, passwordhash, phone]
    );

    const ownerid = userResult.insertId;

    // Create Business
    await db.query(
      `INSERT INTO business (ownerid, businessname, description, address, phone, email, fullName, verified, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active')`,
      [ownerid, businessname, description || '', address || '', phone || '', email, fullName]
    );

    res.status(201).json({ success: true, message: "Business and merchant account created successfully." });
  } catch (error) {
    console.error("Error creating business and merchant:", error);
    res.status(500).json({ success: false, message: "Server error creating business" });
  }
};
