import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import MerchantProfile from "../components/MerchantProfile";
import DealManagement from "../Components/DealManagement";
import OrderManagement from "../Components/OrderManagement";
import ReviewManagement from "../components/ReviewManagement";
import "./MerchantDashboard.css";

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <MerchantProfile />;
      case "deals":
        return <DealManagement />;
      case "orders":
        return <OrderManagement />;
      case "reviews":
        return <ReviewManagement />;
      default:
        return <MerchantProfile />;
    }
  };

  return (
    <div className="merchant-dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="merchant-sidebar">
        <div className="sidebar-header">
          <h2>DealHub Merchant</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <i className="fa-solid fa-user"></i> Profile
            </li>
            <li
              className={activeTab === "deals" ? "active" : ""}
              onClick={() => setActiveTab("deals")}
            >
              <i className="fa-solid fa-tags"></i> Deals
            </li>
            <li
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fa-solid fa-receipt"></i> Orders & Coupons
            </li>
            <li
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              <i className="fa-solid fa-star"></i> Reviews
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="merchant-main-content">
        <header className="merchant-topbar">
          <div className="topbar-welcome">
            <h3>Welcome to your Dashboard</h3>
          </div>
        </header>
        <section className="merchant-content-area">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default MerchantDashboard;
