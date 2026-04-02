import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MerchantProfile.css";

const MerchantProfile = () => {
  const [profile, setProfile] = useState({
    businessName: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/merchants/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch merchant profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/merchants/profile",
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <div className="merchant-loader">Loading profile...</div>;
  }

  return (
    <div className="merchant-profile-card">
      <div className="profile-header">
        <h2>Business Profile</h2>
        <p>Update your business and contact details below.</p>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form className="merchant-profile-form" onSubmit={handleSubmit}>
        <div className="form-group-row">
          <div className="form-group half-width">
            <label>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={profile.businessname || profile.businessName || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group half-width">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName || profile.fullname || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group half-width">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group half-width">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Business Address</label>
          <textarea
            name="address"
            value={profile.address || ""}
            onChange={handleChange}
            rows="3"
            required
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default MerchantProfile;
