import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MerchantSignup.css";

function MerchantSignup() {
  const [form, setForm] = useState({
    businessName: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/merchant-register",
        form
      );

      alert("Business Registered Successfully! Please verify your email.");
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      alert(error.response?.data?.message || "Merchant Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merchant-signup-container">
      {/* Left Panel - Benefits Area */}
      <div className="benefits-panel">
        <div className="benefits-content">
          <h1>Grow Your Business with DealHub</h1>
          <p>
            Join thousands of local businesses reaching new customers every day.
            Sign up now and start running your first campaign in minutes.
          </p>

          <div className="benefit-item">
            <div className="benefit-icon">📈</div>
            <div className="benefit-text">
              <h3>Reach Local Customers</h3>
              <p>Get your business in front of thousands of active shoppers in your area looking for new experiences.</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">💸</div>
            <div className="benefit-text">
              <h3>Boost Your Revenue</h3>
              <p>Fill empty seats, clear inventory, and increase your daily sales volume through targeted deal campaigns.</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">🛠️</div>
            <div className="benefit-text">
              <h3>Tools to Succeed</h3>
              <p>Access our merchant dashboard to track performance, manage redemption, and understand your customers better.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="form-panel">
        <div className="merchant-card">
          <div className="merchant-header">
            <h2>Partner With Us</h2>
            <p>Tell us a bit about your business to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="merchant-form">
            <div className="input-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="The Local Cafe"
                value={form.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="fullName">Your Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="email">Work Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="contact@business.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="address">Business Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="123 Main St, City, State 12345"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a secure password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="merchant-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Merchant Account"}
            </button>
          </form>

          <div className="merchant-footer">
            <p>
              Already a partner? <Link to="/login">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantSignup;
