import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DealManagement.css";
import DealFormModal from "./DealFormModal";

const DealManagement = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/deals/merchant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError("Failed to load deals. Please try again.");
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedDeal(null);
    setShowModal(true);
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeals(); // Refresh list
    } catch (err) {
      alert("Error deleting deal");
    }
  };

  const handleToggleStatus = async (deal) => {
    const newStatus = deal.status === "active" ? "inactive" : "active";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/deals/${deal.dealid}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDeals(); // Refresh list
    } catch (err) {
      alert(`Error ${newStatus === "active" ? "resuming" : "pausing"} deal`);
    }
  };

  const calculateDiscount = (orig, disc) => {
    if (!orig || !disc) return 0;
    return Math.round(((orig - disc) / orig) * 100);
  };

  if (loading) return <div className="deal-management-container"><p>Loading deals...</p></div>;

  return (
    <div className="deal-management-container">
      <div className="deal-management-header">
        <h2>Manage Your Deals</h2>
        <button className="btn-add-deal" onClick={handleCreateNew}>
          <i className="fa-solid fa-plus"></i> Create New Deal
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {deals.length === 0 ? (
        <div className="empty-deals">
          <i className="fa-solid fa-tags"></i>
          <p>You haven't created any deals yet.</p>
          <button className="btn-add-deal" style={{ margin: "20px auto" }} onClick={handleCreateNew}>
            Get Started
          </button>
        </div>
      ) : (
        <div className="deals-grid">
          {deals.map((deal) => (
            <div key={deal.dealid} className="deal-card">
              <div className="deal-image-wrapper">
                <img src={deal.imageurl || "https://via.placeholder.com/400x200?text=No+Image"} alt={deal.title} className="deal-image" />
                <span className={`deal-status-badge status-${deal.status}`}>
                  {deal.status === 'active' ? 'Live' : deal.status === 'inactive' ? 'Paused' : 'Expired'}
                </span>
              </div>
              <div className="deal-content">
                <h3 className="deal-title">{deal.title}</h3>
                <p className="deal-description">{deal.description}</p>
                <div className="deal-pricing">
                  <span className="discount-price">${deal.discountprice}</span>
                  <span className="original-price">${deal.originalprice}</span>
                  <span className="discount-percent">{calculateDiscount(deal.originalprice, deal.discountprice)}% OFF</span>
                </div>
                <div className="deal-meta">
                  <span><i className="fa-solid fa-box"></i> {deal.quantityavailable} Left</span>
                  <span><i className="fa-solid fa-calendar"></i> Ends {new Date(deal.enddate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="deal-actions">
                <button className="action-btn btn-edit" onClick={() => handleEdit(deal)}>
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button className="action-btn btn-pause" onClick={() => handleToggleStatus(deal)}>
                  <i className={deal.status === 'active' ? "fa-solid fa-pause" : "fa-solid fa-play"}></i>
                  {deal.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button className="action-btn btn-delete" onClick={() => handleDelete(deal.dealid)}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DealFormModal
          deal={selectedDeal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchDeals();
          }}
        />
      )}
    </div>
  );
};

export default DealManagement;
