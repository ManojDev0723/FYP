import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CouponManagement.css";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'redeemed', 'not_redeemed'

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/merchants/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to load coupons. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemToggle = async (couponId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/merchants/coupons/${couponId}/redeem`,
        { redeemed: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Soft update local state
      setCoupons(prev =>
        prev.map(c =>
          c.couponid === couponId
            ? { ...c, redeemed: !currentStatus ? 1 : 0, redeemedat: !currentStatus ? new Date().toISOString() : null }
            : c
        )
      );
    } catch (err) {
      console.error("Error updating coupon status:", err);
      alert("Failed to update coupon status.");
    }
  };

  const filteredCoupons = coupons ? coupons.filter((coupon) => {
    const matchesSearch =
      coupon.couponcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const isRedeemed = coupon.redeemed === 1;
    const matchesFilter =
      filter === "all" ||
      (filter === "redeemed" && isRedeemed) ||
      (filter === "not_redeemed" && !isRedeemed);

    return matchesSearch && matchesFilter;
  }) : [];

  if (loading) return <div className="coupons-loading-overlay"><div className="loader"></div></div>;

  return (
    <div className="coupon-management-container">
      <div className="coupon-header">
        <h2>Coupon Validation & Management</h2>
        <p>Verify and manage all coupons purchased for your deals.</p>
      </div>

      {error ? (
        <div className="coupon-error-msg">{error}</div>
      ) : (
        <>
          <div className="coupon-controls">
            <div className="coupon-search">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Search by Coupon Code, Customer, or Deal Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="coupon-filters">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === "redeemed" ? "active" : ""}`}
                onClick={() => setFilter("redeemed")}
              >
                Redeemed
              </button>
              <button
                className={`filter-btn ${filter === "not_redeemed" ? "active" : ""}`}
                onClick={() => setFilter("not_redeemed")}
              >
                Not Redeemed
              </button>
            </div>
          </div>

          <div className="coupons-grid">
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => (
                <div key={coupon.couponid} className={`coupon-card ${coupon.redeemed === 1 ? 'is-redeemed' : ''}`}>
                  <div className="coupon-card-header">
                    <h4>{coupon.dealTitle}</h4>
                    <span className={`status-badge ${coupon.redeemed === 1 ? 'redeemed' : 'pending'}`}>
                      {coupon.redeemed === 1 ? "Redeemed" : "Valid"}
                    </span>
                  </div>
                  <div className="coupon-card-body">
                    <div className="coupon-info-group">
                      <label>Coupon Code</label>
                      <span className="code-text">{coupon.couponcode}</span>
                    </div>
                    <div className="coupon-info-group">
                      <label>Customer</label>
                      <span>{coupon.customerName}</span>
                    </div>
                    <div className="coupon-info-group">
                      <label>Purchased On</label>
                      <span>{new Date(coupon.purchasedate).toLocaleDateString()}</span>
                    </div>
                    {coupon.redeemed === 1 && coupon.redeemedat && (
                      <div className="coupon-info-group">
                        <label>Redeemed On</label>
                        <span>{new Date(coupon.redeemedat).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="coupon-card-footer">
                    <button
                      className={`action-btn ${coupon.redeemed === 1 ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleRedeemToggle(coupon.couponid, coupon.redeemed === 1)}
                    >
                      {coupon.redeemed === 1 ? "Mark Unredeemed" : "Mark as Redeemed"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-coupons-found">
                <i className="fa-solid fa-ticket-simple"></i>
                <p>No coupons found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CouponManagement;
