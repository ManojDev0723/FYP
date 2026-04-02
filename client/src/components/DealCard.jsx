import React from "react";
import { Link } from "react-router-dom";

const DealCard = ({ deal }) => {
  // Handles both camelCase (mock data) and lowercase (API data)
  const originalPrice = deal.originalprice || deal.originalPrice;
  const discountPrice = deal.discountprice || deal.discountPrice;
  const title = deal.title || deal.name;
  const merchantName = deal.business_name || deal.location;
  const image = deal.imageurl || deal.image;
  const id = deal.dealid || deal.id;

  const discountPercent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);

  return (
    <div className="deal-card-v2">
      <div className="deal-card-image-v2">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="deal-card-placeholder">
            <span className="placeholder-emoji">🏷️</span>
          </div>
        )}
        {discountPercent > 0 && (
          <div className="deal-card-badge-v2">{discountPercent}% OFF</div>
        )}
      </div>

      <div className="deal-card-content-v2">
        <div className="deal-card-merchant-v2">{merchantName}</div>
        <h3 className="deal-card-title-v2">{title}</h3>
        
        <div className="deal-card-rating-v2">
          <span className="stars-v2">★★★★★</span>
          <span className="rating-num-v2">4.8</span>
          <span className="verified-v2">(Verified)</span>
        </div>

        <div className="deal-card-footer-v2">
          <div className="deal-card-pricing-v2">
            <del className="old-price-v2">Rs. {originalPrice}</del>
            <span className="new-price-v2">Rs. {discountPrice}</span>
          </div>
          <Link to={`/deal/${id}`} className="btn-deal-v2" style={{ textAlign: 'center', textDecoration: 'none' }}>
             Explore Deal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
