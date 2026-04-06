import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!orderId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/orders/${orderId}/coupons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCoupons(res.data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [orderId]);

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-main-container" style={{ textAlign: "center", padding: "4rem 1rem", maxWidth: "800px", margin: "auto" }}>
        <h1 style={{ color: "#28a745", marginBottom: "1rem" }}>Payment Successful!</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
          Your payment has been completed and your order <strong>#{orderId}</strong> is confirmed.
        </p>

        {loading ? (
          <p>Loading your vouchers...</p>
        ) : coupons.length > 0 ? (
          <div style={{ textAlign: "left", background: "#f8f9fa", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", borderBottom: "2px solid #e9ecef", paddingBottom: "0.5rem" }}>
              Your Vouchers
            </h2>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {coupons.map((c, i) => (
                <div key={i} style={{ border: "2px dashed #007bff", padding: "1.5rem", borderRadius: "8px", background: "white", textAlign: "center" }}>
                  <h3 style={{ fontSize: "1rem", color: "#6c757d", marginBottom: "0.5rem" }}>{c.dealTitle}</h3>
                  <div style={{ fontSize: "2rem", letterSpacing: "2px", fontWeight: "bold", color: "#007bff", margin: "1rem 0" }}>
                    {c.couponcode}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#495057" }}>
                    Status: <span style={{ fontWeight: "600", textTransform: "uppercase", color: c.status === 'unused' ? '#28a745' : '#dc3545' }}>{c.status}</span>
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#adb5bd", marginTop: "0.5rem" }}>
                    Expires: {new Date(c.expiresat).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.9rem", color: "#6c757d", marginTop: "1.5rem", textAlign: "center" }}>
              Show this code to the merchant to redeem your service. You can also view these at any time in your dashboard.
            </p>
          </div>
        ) : (
          <p>No coupons found for this order.</p>
        )}

        <br />
        <Link to="/home" className="btn-primary" style={{ display: "inline-block" }}>
          Continue Shopping
        </Link>
        <Link to="/dashboard" className="btn-outline" style={{ display: "inline-block", marginLeft: "1rem", padding: "0.75rem 1.5rem", border: "1px solid #007bff", borderRadius: "4px", color: "#007bff", textDecoration: "none" }}>
          Go to Dashboard
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
