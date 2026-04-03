import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Phone, MapPin, Star, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DealCard from "../components/DealCard";
import "./DealDetail.css";

const DealDetail = () => {
  const { dealId } = useParams();
  const [deal, setDeal] = useState(null);
  const [similarDeals, setSimilarDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchDealData = async () => {
      try {
        // Fetch current deal
        const dealResponse = await fetch(`/api/deals/${dealId}`);
        if (!dealResponse.ok) {
          throw new Error("Deal not found or has expired.");
        }
        const dealData = await dealResponse.json();
        setDeal(dealData);

        // Fetch all deals to find similar ones
        const allDealsResponse = await fetch("/api/deals");
        if (allDealsResponse.ok) {
          const allDeals = await allDealsResponse.json();
          const filtered = allDeals
            .filter(d => d.categoryid === dealData.categoryid && d.dealid !== dealData.dealid)
            .slice(0, 4); // Limit to 4 similar deals
          setSimilarDeals(filtered);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDealData();
    window.scrollTo(0, 0); // Scroll to top on id change
  }, [dealId]);

  useEffect(() => {
    if (!deal || !deal.enddate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(deal.enddate) - +new Date();
      let timeLeft = "";

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        if (days > 0) timeLeft += `${days}d `;
        timeLeft += `${hours}h ${minutes}m left`;
      } else {
        timeLeft = "Expired";
      }

      setTimeLeft(timeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [deal]);

  const handleQuantity = (type) => {
    if (type === "inc" && quantity < 10) setQuantity(prev => prev + 1);
    if (type === "dec" && quantity > 1) setQuantity(prev => prev - 1);
  };

  if (loading) return (
    <div className="loading-state">
      <Navbar />
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Loading deal details...</h2>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="error-state">
      <Navbar />
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>{error}</h2>
        <Link to="/home" className="btn-back">Back to Home</Link>
      </div>
      <Footer />
    </div>
  );

  const discountPercentage = Math.round(((deal.originalprice - deal.discountprice) / deal.originalprice) * 100);

  const handleAddToCart = () => {
    const cartItem = {
      dealid: deal.dealid,
      title: deal.title,
      discountprice: deal.discountprice,
      imageurl: deal.imageurl,
      business_name: deal.business_name,
      quantity: quantity,
      variant: "Standard Deal"
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemIndex = existingCart.findIndex(item => item.dealid === deal.dealid);

    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdate"));
    alert("Added to cart!");
  };

  return (
    <div className="deal-detail-page">
      <Navbar />
      
      <header className="deal-header" style={{ maxWidth: '1200px', margin: '2rem auto 1rem', padding: '0 1rem' }}>
        <h1 className="deal-title-main">{deal.title}</h1>
        <div className="business-details-top">
          <span className="biz-name">By {deal.business_name}</span>
          <span className="biz-sep">•</span>
          <span className="biz-phone">
            <Phone size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {deal.phone || "No phone available"}
          </span>
          <span className="biz-sep">•</span>
          <span className="biz-address">
            <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {deal.address || "Location not available"}
          </span>
          <span className="biz-sep">•</span>
          <div className="rating-stars-inline">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                fill={i < Math.floor(deal.avgRating) ? "#ffc107" : "none"}
                stroke={i < Math.floor(deal.avgRating) ? "#ffc107" : "#ccc"}
                style={{ marginRight: '2px' }}
              />
            ))}
            <span className="review-count">({deal.reviewCount} reviews)</span>
          </div>
        </div>
      </header>

      <div className="deal-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Left Column: Image & Description */}
        <div className="image-gallery">
          <div className="main-image-container">
            <img 
              src={deal.imageurl?.startsWith('http') ? deal.imageurl : `/uploads${deal.imageurl}`} 
              alt={deal.title} 
              className="main-image"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb"; }}
            />
          </div>
          
          <section className="deal-description-short">
            <p className="description-content-sidebar">
              {deal.description}
            </p>
          </section>
        </div>

        {/* Right Column: Actions */}
        <div className="deal-info-sidebar">

          <div className="price-section">
            <span className="discount-price">${deal.discountprice}</span>
            <span className="original-price">${deal.originalprice}</span>
            <span className="savings-badge">{discountPercentage}% OFF</span>
          </div>

          <div className="countdown-container">
            <Clock size={18} style={{ marginRight: '4px' }} />
            <span>{timeLeft}</span>
          </div>

          <div className="selectors-container">
            <div className="selector-group">
              <span className="selector-label">Special Offer</span>
              <div className="variant-options">
                 <span className="variant-tag">Standard Deal</span>
              </div>
            </div>

            <div className="selector-group">
              <span className="selector-label">Quantity</span>
              <div className="quantity-selector">
                <button className="qty-btn" onClick={() => handleQuantity("dec")} disabled={quantity <= 1}>-</button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => handleQuantity("inc")} disabled={quantity >= 10}>+</button>
              </div>
            </div>

            <button className="btn-add-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>

      </div>

      {/* Similar Deals Section Moved Back Outside */}
      {similarDeals.length > 0 && (
        <section className="similar-deals-section" style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1rem' }}>
          <h2 className="similar-deals-title">You might also like</h2>
          <div className="similar-deals-grid">
            {similarDeals.map(d => (
              <DealCard key={d.dealid} deal={d} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Footer */}
      <div className="mobile-sticky-footer">
        <div className="mobile-price-info">
          <span className="mobile-price">${deal.discountprice}</span>
          <span className="mobile-original">${deal.originalprice}</span>
        </div>
        <button className="mobile-btn-cart" onClick={handleAddToCart}>Add to Cart</button>
      </div>

      <Footer />
    </div>
  );
};

export default DealDetail;
