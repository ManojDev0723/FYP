import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    };
    loadCart();
  }, []);

  const updateQuantity = (dealid, newQty) => {
    if (newQty < 1) return;
    const updatedCart = cartItems.map(item => 
      item.dealid === dealid ? { ...item, quantity: newQty } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const removeItem = (dealid) => {
    const updatedCart = cartItems.filter(item => item.dealid !== dealid);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.discountprice * item.quantity), 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <Navbar />
        <div className="cart-empty-container">
          <div className="empty-cart-content">
            <ShoppingBag size={80} className="empty-cart-icon" />
            <h1>Your cart is empty</h1>
            <p>Looks like you haven't added any deals to your cart yet.</p>
            <Link to="/home" className="btn-browse-deals">
              Browse Deals
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <Navbar />
      
      <div className="cart-main-container">
        <header className="cart-header">
          <h1>Shopping Cart ({cartItems.length})</h1>
          <Link to="/home" className="continue-shopping">
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </header>

        <div className="cart-content-layout">
          {/* Items List */}
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.dealid} className="cart-item-card">
                <div className="item-image">
                  <img 
                    src={item.imageurl?.startsWith('http') ? item.imageurl : `/uploads${item.imageurl}`} 
                    alt={item.title}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb"; }}
                  />
                </div>
                
                <div className="item-details">
                  <div className="item-info">
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-variant">Variant: {item.variant || "Standard Deal"}</p>
                    <p className="item-merchant">By {item.business_name}</p>
                  </div>
                  
                  <div className="item-pricing">
                    <div className="unit-price">
                      <span className="price-label">Price</span>
                      <span className="price-value">${item.discountprice}</span>
                    </div>
                    
                    <div className="quantity-controls">
                      <span className="price-label">Quantity</span>
                      <div className="stepper">
                        <button className="stepper-btn" onClick={() => updateQuantity(item.dealid, item.quantity - 1)}>
                          <Minus size={16} />
                        </button>
                        <span className="stepper-val">{item.quantity}</span>
                        <button className="stepper-btn" onClick={() => updateQuantity(item.dealid, item.quantity + 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="line-total">
                      <span className="price-label">Total</span>
                      <span className="price-value">${(item.discountprice * item.quantity).toFixed(2)}</span>
                    </div>
                    
                    <button className="btn-remove" onClick={() => removeItem(item.dealid)} title="Remove Item">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <aside className="cart-summary-sidebar">
            <div className="summary-box">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Service Fee</span>
                <span>$0.00</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <button className="btn-checkout" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
              
              <div className="secure-checkout-hint">
                <p>🔒 Secure Checkout Guaranteed</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
