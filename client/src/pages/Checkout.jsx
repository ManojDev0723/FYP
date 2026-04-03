import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Lock, ShieldCheck, ChevronDown, ChevronUp, Package, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Checkout.css";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(storedCart);
    };
    loadCart();
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.discountprice * item.quantity), 0);
  };

  const handleBuy = () => {
    alert("Order Placed Successfully!");
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdate"));
    navigate("/dashboard");
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
          <h2>Your cart is empty</h2>
          <p>Please add items before checking out.</p>
          <Link to="/home" className="btn-primary" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>Browse Deals</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-main-container">
        {/* Mobile Mini Summary Accordion */}
        <div className="mobile-summary-accordion">
          <button className="accordion-toggle" onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
            <div className="toggle-label">
              <Package size={20} />
              <span>{isSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}</span>
              {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            <span className="mini-total">${calculateSubtotal().toFixed(2)}</span>
          </button>
          
          {isSummaryOpen && (
            <div className="mobile-summary-content">
              {cartItems.map((item) => (
                <div key={item.dealid} className="mobile-item">
                  <img src={item.imageurl?.startsWith('http') ? item.imageurl : `/uploads${item.imageurl}`} alt={item.title} />
                  <div className="mobile-item-info">
                    <span className="m-title">{item.title}</span>
                    <span className="m-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="m-price">${(item.discountprice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="checkout-content-grid">
          {/* Left Column: Payment Section */}
          <div className="payment-column">
            <header className="payment-header">
              <h1>Checkout</h1>
              <Link to="/cart" className="back-to-cart">
                <ArrowLeft size={16} /> Back to Cart
              </Link>
            </header>

            <section className="payment-card">
              <div className="section-title">
                <ShieldCheck color="#16a34a" size={24} />
                <h2>Secure Payment</h2>
              </div>
              
              <form className="payment-form">
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="Full Name on Card" required />
                </div>
                
                <div className="form-group">
                  <label>Card Number</label>
                  <div className="card-input-wrapper">
                    <input type="text" placeholder="0000 0000 0000 0000" readOnly />
                    <CreditCard size={20} className="card-icon" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" readOnly />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="***" readOnly />
                  </div>
                </div>
                
                <div className="payment-hint">
                  <p>🔒 All transactions are secure and encrypted.</p>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Order Summary Sidebar (Desktop Only) */}
          <aside className="checkout-sidebar">
            <div className="summary-sticky-box">
              <h3>Order Summary</h3>
              
              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div key={item.dealid} className="summary-item">
                    <div className="s-img-wrapper">
                      <img 
                        src={item.imageurl?.startsWith('http') ? item.imageurl : `/uploads${item.imageurl}`} 
                        alt={item.title}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb" }}
                      />
                      <span className="s-badge">{item.quantity}</span>
                    </div>
                    <div className="s-item-info">
                      <span className="s-title">{item.title}</span>
                      <span className="s-variant">{item.variant || "Standard Deal"}</span>
                    </div>
                    <span className="s-price">${(item.discountprice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-pricing">
                <div className="pricing-row">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span>Service Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="pricing-row total-bold">
                  <span>Total</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>

              <button className="btn-buy" onClick={handleBuy}>
                Buy Now
              </button>
              
              <div className="safe-checkout-footer">
                <Lock size={16} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
