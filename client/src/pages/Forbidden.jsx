import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Forbidden.css";

const Forbidden = () => {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate("/home");
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="forbidden-page">
      <Navbar />
      <main className="forbidden-container">
        <div className="forbidden-card">
          <div className="forbidden-icon-wrapper">
            <ShieldAlert size={64} color="#e53e3e" />
          </div>
          
          <h1>403 - Access Denied</h1>
          <p className="forbidden-msg">
            Sorry, you don't have the required permissions to access this page.
          </p>
          
          <div className="countdown-display">
            Rest assured, redirecting you to safety in <span>{countdown}</span>...
          </div>
          
          <div className="forbidden-actions">
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Go Back
            </button>
            <button className="btn-primary" onClick={() => navigate("/home")}>
              <Home size={18} /> Home Now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forbidden;
