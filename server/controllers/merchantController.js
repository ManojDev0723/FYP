const db = require("../config/db");

const getMerchantProfile = async (req, res) => {
  try {
    // req.userId is set by the protect middleware and corresponds to the ownerid in the business table
    const [businesses] = await db.query(
      "SELECT businessid, businessname, fullName, email, phone, address, verified FROM business WHERE ownerid = ?",
      [req.userId]
    );

    if (businesses.length === 0) {
      return res.status(404).json({ message: "Merchant profile not found" });
    }

    res.json(businesses[0]);
  } catch (error) {
    console.error("Error fetching merchant profile:", error);
    res.status(500).json({ message: "Server error fetching merchant profile" });
  }
};

const updateMerchantProfile = async (req, res) => {
  try {
    const { businessName, fullName, email, phone, address } = req.body;

    if (!businessName || !fullName || !email || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await db.query(
      "UPDATE business SET businessname = ?, fullName = ?, email = ?, phone = ?, address = ? WHERE ownerid = ?",
      [businessName, fullName, email, phone, address, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Merchant profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      profile: { businessName, fullName, email, phone, address },
    });
  } catch (error) {
    console.error("Error updating merchant profile:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

module.exports = {
  getMerchantProfile,
  updateMerchantProfile,
};
