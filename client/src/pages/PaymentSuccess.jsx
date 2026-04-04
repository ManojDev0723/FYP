import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-main-container" style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <h1>Payment Successful</h1>
        <p>Your payment has been completed successfully.</p>
        {orderId && <p>Your order reference is <strong>{orderId}</strong>.</p>}
        <Link to="/home" className="btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Continue Shopping
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
