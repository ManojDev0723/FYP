const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { sendOTP } = require("../utils/emailService");

const register = async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;

    if (!fullname || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (fullname, email, password, phone, role, otp, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [fullname, email, hashedPassword, phone, 'customer', otp, otpExpiry, 0]
    );

    // Send OTP to email
    await sendOTP(email, otp);

    res.status(201).json({
      message: "User registered successfully, please verify your email.",
      email: email, // Returned to inform frontend where to verify
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

const merchantRegister = async (req, res) => {
  // We use a transaction so that if the business insertion fails, the user is rolled back
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { businessName, fullName, email, password, phone, address } = req.body;

    if (!businessName || !fullName || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 1. Insert new user
    const [userResult] = await connection.query(
      "INSERT INTO users (fullname, email, password, phone, role, otp, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [fullName, email, hashedPassword, phone, 'business', otp, otpExpiry, 0]
    );

    const ownerId = userResult.insertId;

    // 2. Insert into business table using the new user's ID
    await connection.query(
      "INSERT INTO business (ownerid, businessname, fullName, email, phone, address, verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [ownerId, businessName, fullName, email, phone, address, 0] // 0 for unverified initially
    );

    await connection.commit();

    // Send OTP
    await sendOTP(email, otp);

    res.status(201).json({
      message: "Merchant registered successfully, please verify your email.",
      email: email,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error in merchant register:", error);
    res.status(500).json({ message: "Server error during merchant registration", error: error.message });
  } finally {
    connection.release();
  }
};

const getMe = async (req, res) => {
  try {
    // req.userId is set by the authMiddleware
    const [users] = await db.query(
      "SELECT userid, fullname, email, phone FROM users WHERE userid = ?",
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error fetching user data" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Block unverified users
    if (user.is_verified === 0) {
      return res.status(403).json({ message: "Please verify your email before logging in", email: user.email, requiresVerification: true });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userid },
      process.env.JWT_SECRET || "your_jwt_secret_key", // Fallback if not in .env
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.userid,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phone } = req.body;

    if (!fullname || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email is already taken by another user
    const [existingUsers] = await db.query(
      "SELECT userid FROM users WHERE email = ? AND userid != ?",
      [email, req.userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email is already in use by another account" });
    }

    const [result] = await db.query(
      "UPDATE users SET fullname = ?, email = ?, phone = ? WHERE userid = ?",
      [fullname, email, phone, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: { fullname, email, phone } });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin in the 'admin' table
    const [admins] = await db.query("SELECT * FROM admin WHERE email = ?", [
      email,
    ]);

    if (admins.length === 0) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const adminUser = admins[0];

    // Check password (handling both bcrypt hash and plain-text for legacy/dev reasons)
    let isMatch = false;
    if (adminUser.passwordhash.startsWith('$2b$') || adminUser.passwordhash.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(password, adminUser.passwordhash);
    } else {
      // Plain text comparison
      isMatch = (password === adminUser.passwordhash);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { userId: adminUser.adminid, role: 'admin' },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1d" }
    );

    // Update last login and record log
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    
    await db.query("UPDATE admin SET last_login = NOW() WHERE adminid = ?", [adminUser.adminid]);
    await db.query("INSERT INTO admin_login_logs (adminid, ipaddress, useragent) VALUES (?, ?, ?)", [
      adminUser.adminid,
      ip,
      ua
    ]);

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: adminUser.adminid,
        fullname: adminUser.username, // Using username as fullname for admin
        email: adminUser.email,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "Server error during admin login" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check expiry
    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark as verified
    await db.query("UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?", [email]);

    // Issue JWT like login
    const token = jwt.sign(
      { userId: user.userid },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Email verified successfully.",
      token,
      user: {
        id: user.userid,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];
    if (user.is_verified) return res.status(400).json({ message: "Email is already verified" });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.query("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?", [newOtp, newOtpExpiry, email]);

    await sendOTP(email, newOtp);

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({ message: "Server error while resending OTP" });
  }
};

module.exports = {
  register,
  login,
  merchantRegister,
  getMe,
  updateProfile,
  adminLogin,
  verifyOTP,
  resendOTP,
};
