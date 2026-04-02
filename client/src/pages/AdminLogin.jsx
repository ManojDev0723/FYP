import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Store, ShieldCheck, AlertCircle } from "lucide-react";
import "../styles/AdminDashboard.css";

function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/admin-login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "admin");

      navigate("/admin/overview");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Left Column: Branding */}
      <div className="admin-login-left">
        <div className="admin-login-branding">
          <Store size={64} color="#00b1ff" style={{ marginBottom: '2rem' }} />
          <h1>DealHub <span>Admin</span></h1>
          <p>
            Secure access to the DealHub Control Panel. Manage deals, businesses, and users with ease.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="admin-login-right">
        <div className="admin-login-form-wrapper">
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#00b1ff', 
              fontWeight: 700, 
              fontSize: '0.75rem', 
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={16} /> 
              Secure Access
            </div>
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="admin-error-alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="admin-form-input"
                placeholder="admin@dealhub.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="admin-form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              &copy; 2026 DealHub Admin System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
