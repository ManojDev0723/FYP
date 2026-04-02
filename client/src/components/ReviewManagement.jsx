import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ReviewManagement.css";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // ID of the review being replied to
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/merchants/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/merchants/reviews/${reviewId}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setReviews(reviews.map(r => 
        r.reviewid === reviewId ? { ...r, merchant_reply: replyText } : r
      ));
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return dist;
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (loading) return <div className="placeholder-content"><h2>Loading Reviews...</h2></div>;

  const avgRating = calculateAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div className="review-mgmt-container">
      <div className="review-mgmt-header">
        <h1>Customer Reviews & Ratings</h1>
        <p>Manage feedback and interact with your customers to build trust.</p>
      </div>

      {/* Overview Section */}
      <div className="ratings-summary-section">
        <div className="average-rating-card">
          <span className="rating-score">{avgRating}</span>
          <div className="rating-stars">{renderStars(Math.round(avgRating))}</div>
          <span className="total-reviews-count">Based on {reviews.length} reviews</span>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="dist-bar-row">
              <span className="bar-label">{stars} Stars</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${reviews.length ? (distribution[stars] / reviews.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="bar-value">{distribution[stars]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="review-list-header">
        <h2>Recent Feedback</h2>
      </div>

      <div className="reviews-grid">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.reviewid} className="review-card">
              <div className="review-card-top">
                <div className="review-user-info">
                  <h4>{review.customerName}</h4>
                  <span className="review-date">{new Date(review.createdat).toLocaleDateString()}</span>
                </div>
                <div className="review-rating-stars">
                  {renderStars(review.rating)}
                </div>
              </div>

              <div className="review-deal-tag">
                <i className="fa-solid fa-tag"></i> {review.dealTitle}
              </div>

              <div className="review-content">
                {review.comment || "No comment provided."}
              </div>

              <div className="merchant-reply-area">
                {review.merchant_reply ? (
                  <div className="reply-content">
                    <div className="reply-badge">
                      <i className="fa-solid fa-reply"></i> Your Response
                    </div>
                    <div className="reply-text">{review.merchant_reply}</div>
                  </div>
                ) : replyingTo === review.reviewid ? (
                  <div className="reply-form">
                    <textarea 
                      placeholder="Write your response here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
                      <button className="toggle-reply-btn" onClick={() => setReplyingTo(null)} style={{ borderColor: '#888', color: '#888' }}>Cancel</button>
                      <button 
                        className="reply-submit-btn" 
                        onClick={() => handleReplySubmit(review.reviewid)}
                        disabled={submittingReply || !replyText.trim()}
                      >
                        {submittingReply ? "Submitting..." : "Submit Response"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="toggle-reply-btn" onClick={() => {
                    setReplyingTo(review.reviewid);
                    setReplyText("");
                  }}>
                    <i className="fa-solid fa-reply"></i> Reply to Customer
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="placeholder-content">
            <i className="fa-solid fa-comment-slash" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
            <p>No reviews found for your deals yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
