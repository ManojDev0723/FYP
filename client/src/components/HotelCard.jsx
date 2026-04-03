import React from "react";
import { Link } from "react-router-dom";

const HotelCard = ({ hotel }) => {
  const discountPercent = Math.round(((hotel.originalPrice - hotel.discountPrice) / hotel.originalPrice) * 100);

  return (
    <div className="hotel-card">
      <div className="hotel-card-image">
        <img src={hotel.image} alt={hotel.name} />
        {discountPercent > 0 && (
          <div className="hotel-badge">{discountPercent}% OFF</div>
        )}
      </div>

      <div className="hotel-card-content">
        <div className="hotel-location">{hotel.location}</div>
        <h3 className="hotel-name">{hotel.name}</h3>
        
        <div className="hotel-rating">
          <span className="hotel-stars">★★★★★</span>
          <span className="rating-value">{hotel.rating}</span>
          <span className="reviews">(Verified)</span>
        </div>

        <div className="hotel-pricing">
          <del className="original-price">${hotel.originalPrice}</del>
          <span className="discount-price">${hotel.discountPrice}</span>
        </div>

        <Link to={`/deals/${hotel.id}`} className="btn-view-deal" style={{ textAlign: 'center', textDecoration: 'none' }}>
           View Deal
        </Link>
      </div>
    </div>
  );
};

export default HotelCard;