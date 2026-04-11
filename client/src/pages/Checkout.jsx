import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Lock, ShieldCheck, ChevronDown, ChevronUp, Package, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import KhaltiPayment from "../components/KhaltiPayment";
import "./Checkout.css";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
  const [orderId, setOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("khalti"); // Default to Khalti
  const [loadingStripe, setLoadingStripe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCart);
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.discountprice * item.quantity, 0);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const buildOrderItems = () => {
    return cartItems.map((item) => ({
      dealid: item.dealid,
      quantity: item.quantity,
    }));
  };

  const isFormValid = () => {
    return (
      customerInfo.name.trim() &&
      customerInfo.email.trim() &&
      customerInfo.phone.trim() &&
      cartItems.length > 0
    );
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (!isFormValid()) {
      setErrorMessage("Please complete your customer information and ensure your cart has items.");
      return;
    }

    setErrorMessage("");
    setLoadingOrder(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "/api/orders/create",
        {
          items: buildOrderItems(),
          orderName: `DealHub order`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrderId(response.data.orderId);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Unable to create order.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleStripePayment = async () => {
    setLoadingStripe(true);
    setErrorMessage("");
    try {
      const response = await axios.post("/api/stripe/create-checkout-session", {
        orderId: orderId,
      });

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        setErrorMessage("Failed to initiate Stripe payment.");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Stripe payment error.");
    } finally {
      setLoadingStripe(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div style={{ padding: "6rem 1rem", textAlign: "center" }}>
          <h2>Your cart is empty</h2>
          <p>Please add items before checking out.</p>
          <Link to="/home" className="btn-primary" style={{ textDecoration: "none", marginTop: "1rem", display: "inline-block" }}>
            Browse Deals
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      <div className="checkout-main-container">
        <div className="mobile-summary-accordion">
          <button className="accordion-toggle" onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
            <div className="toggle-label">
              <Package size={20} />
              <span>{isSummaryOpen ? "Hide Order Summary" : "Show Order Summary"}</span>
              {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            <span className="mini-total">${calculateSubtotal().toFixed(2)}</span>
          </button>

          {isSummaryOpen && (
            <div className="mobile-summary-content">
              {cartItems.map((item) => (
                <div key={item.dealid} className="mobile-item">
                  <img
                    src={item.imageurl?.startsWith("http") ? item.imageurl : `/uploads${item.imageurl}`}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
                    }}
                  />
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

              <form className="payment-form" onSubmit={handleCreateOrder}>
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="payment-hint">
                  <p>🔒 All transactions are secure and encrypted.</p>
                </div>

                {errorMessage && <p className="form-error">{errorMessage}</p>}

                {!orderId ? (
                  <button className="btn-buy" type="submit" disabled={loadingOrder || !isFormValid()}>
                    {loadingOrder ? "Preparing order..." : "Create Order"}
                  </button>
                ) : (
                  <div className="payment-options-container">
                    <div className="order-created-note">
                      <p>Order #{orderId} created. Choose your payment method:</p>
                    </div>
                    
                    <div className="payment-method-selector">
                      <label className={`method-card ${paymentMethod === 'khalti' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="khalti" 
                          checked={paymentMethod === 'khalti'}
                          onChange={() => setPaymentMethod('khalti')}
                        />
                        <div className="method-info">
                          <span className="method-name">Khalti</span>
                          <span className="method-desc">Pay with Khalti Wallet or eBanking</span>
                        </div>
                      </label>

                      <label className={`method-card ${paymentMethod === 'stripe' ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="stripe" 
                          checked={paymentMethod === 'stripe'}
                          onChange={() => setPaymentMethod('stripe')}
                        />
                        <div className="method-info">
                          <span className="method-name">Credit/Debit Card (Stripe)</span>
                          <span className="method-desc">Secure payment via Stripe</span>
                        </div>
                      </label>
                    </div>

                    {paymentMethod === 'khalti' ? (
                      <KhaltiPayment
                        orderId={orderId}
                        orderName={`DealHub Order #${orderId}`}
                        customerInfo={customerInfo}
                        onError={setErrorMessage}
                      />
                    ) : (
                      <button 
                        type="button" 
                        className="btn-pay-stripe" 
                        onClick={handleStripePayment}
                        disabled={loadingStripe}
                      >
                        {loadingStripe ? "Redirecting..." : "Pay with Card"}
                      </button>
                    )}
                  </div>
                )}
              </form>
            </section>
          </div>

          <aside className="checkout-sidebar">
            <div className="summary-sticky-box">
              <h3>Order Summary</h3>

              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div key={item.dealid} className="summary-item">
                    <div className="s-img-wrapper">
                      <img
                        src={item.imageurl?.startsWith("http") ? item.imageurl : `/uploads${item.imageurl}`}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
                        }}
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
