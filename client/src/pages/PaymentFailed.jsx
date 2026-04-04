import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css";

const PaymentFailed = () => {
  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-main-container" style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <h1>Payment Failed</h1>
        <p>We could not complete your payment. Please try again or contact support.</p>
        <Link to="/checkout" className="btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Return to Checkout
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentFailed;
