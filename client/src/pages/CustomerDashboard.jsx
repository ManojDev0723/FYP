import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCart = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(storedCart);
    };

    updateCart();
    window.addEventListener("cartUpdate", updateCart);
    return () => window.removeEventListener("cartUpdate", updateCart);
  }, []);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Simulated mock items for visual representation
  const wishlistItems = [
    { id: 1, title: "Deluxe Room Lakeside Hotel", price: 2500, emoji: "🏨" },
    { id: 2, title: "Premium Spa Package", price: 1650, emoji: "💆" },
    { id: 3, title: "Boutique Hotel Room", price: 2700, emoji: "🏨" },
  ];

  const handleRemoveCartItem = (dealid) => {
    const updatedCart = cartItems.filter(item => item.dealid !== dealid);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.discountprice * item.quantity), 0);

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <form className="dashboard-form" onSubmit={handleSaveChanges}>
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullname"
                value={user.fullname || ""} 
                onChange={handleUserChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={user.email || ""} 
                onChange={handleUserChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={user.phone || ""} 
                onChange={handleUserChange}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        );

      case "password":
        return (
          <div className="dashboard-form">
            <h2>Change Password</h2>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
            <button className="btn-primary">Update Password</button>
          </div>
        );

      case "wishlist":
        return (
          <div className="dashboard-form">
            <h2>My Wishlist</h2>
            {wishlistItems.length > 0 ? (
              <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="wishlist-card">
                    <div className="wishlist-img">{item.emoji}</div>
                    <div className="wishlist-info">
                      <h4>{item.title}</h4>
                      <div className="wishlist-price">Rs. {item.price}</div>
                      <button className="btn-remove">Remove from Wishlist</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="icon">🤍</span>
                <p>Your wishlist is empty. Start exploring deals!</p>
              </div>
            )}
          </div>
        );

      case "cart":
        return (
          <div className="dashboard-form" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Shopping Cart</h2>
              <Link to="/cart" style={{ color: '#16a34a', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>View Full Cart</Link>
            </div>
            {cartItems.length > 0 ? (
              <>
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <div key={item.dealid} className="cart-item">
                      <div className="cart-item-img-container">
                        <img 
                          src={item.imageurl?.startsWith('http') ? item.imageurl : `/uploads${item.imageurl}`} 
                          alt={item.title}
                          className="cart-item-thumb"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb" }}
                        />
                      </div>
                      <div className="cart-item-info">
                        <h4>{item.title}</h4>
                        <p>Quantity: {item.quantity} | {item.variant || "Standard Deal"}</p>
                      </div>
                      <div className="cart-item-price">${(item.discountprice * item.quantity).toFixed(2)}</div>
                      <button 
                        className="cart-item-remove" 
                        title="Remove item"
                        onClick={() => handleRemoveCartItem(item.dealid)}
                      >×</button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="total">
                    <span>Subtotal:</span>
                    <span>${totalCartPrice.toFixed(2)}</span>
                  </div>
                  <button className="btn-checkout" onClick={() => navigate("/cart")}>Proceed to Checkout</button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span className="icon">🛒</span>
                <p>Your cart is empty.</p>
                <Link to="/home" className="btn-primary" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>Browse Deals</Link>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center', height: '500px' }}>
          <h2>Loading your dashboard...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null; // Will redirect in useEffect

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="user-profile-summary">
            <div className="profile-avatar">
              {user.fullname.charAt(0)}
            </div>
            <div className="profile-info">
              <h3>{user.fullname}</h3>
              <p>Customer Account</p>
            </div>
          </div>
          
          <ul className="sidebar-nav">
            <li>
              <button 
                className={activeTab === "personal" ? "active" : ""} 
                onClick={() => setActiveTab("personal")}
              >
                <span className="icon">👤</span> Personal Info
              </button>
            </li>
            <li>
              <button 
                className={activeTab === "password" ? "active" : ""} 
                onClick={() => setActiveTab("password")}
              >
                <span className="icon">🔒</span> Change Password
              </button>
            </li>
            <li>
              <button 
                className={activeTab === "wishlist" ? "active" : ""} 
                onClick={() => setActiveTab("wishlist")}
              >
                <span className="icon">❤️</span> Wishlist
              </button>
            </li>
            <li>
              <button 
                className={activeTab === "cart" ? "active" : ""} 
                onClick={() => setActiveTab("cart")}
              >
                <span className="icon">🛒</span> Shopping Cart
              </button>
            </li>
            <li style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <button style={{ color: '#e53e3e' }} onClick={handleLogout}>
                <span className="icon">🚪</span> Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Dynamic Content Area */}
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerDashboard;
