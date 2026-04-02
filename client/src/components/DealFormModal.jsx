import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DealFormModal.css";

const DealFormModal = ({ deal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalprice: "",
    discountprice: "",
    startdate: "",
    enddate: "",
    quantityavailable: "",
    imageurl: "",
    categoryid: 1, // Default category
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (deal) {
      // Format dates for input type="date"
      const formatData = { ...deal };
      if (deal.startdate) formatData.startdate = new Date(deal.startdate).toISOString().split('T')[0];
      if (deal.enddate) formatData.enddate = new Date(deal.enddate).toISOString().split('T')[0];
      setFormData({
        title: deal.title || "",
        description: deal.description || "",
        originalprice: deal.originalprice || "",
        discountprice: deal.discountprice || "",
        startdate: formatData.startdate || "",
        enddate: formatData.enddate || "",
        quantityavailable: deal.quantityavailable || "",
        imageurl: deal.imageurl || "",
        categoryid: deal.categoryid || 1,
      });
    }
  }, [deal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/deals/upload", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData((prev) => ({ ...prev, imageurl: res.data.imageUrl }));
      setUploading(false);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (deal) {
        // Update
        await axios.put(`http://localhost:5000/api/deals/${deal.dealid}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create
        await axios.post("http://localhost:5000/api/deals", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Failed to save deal. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="deal-modal">
        <div className="modal-header">
          <h3>{deal ? "Edit Deal" : "Create New Deal"}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="deal-form">
          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label>Deal Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 50% Off Gourmet Dinner for Two"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what's included in the deal..."
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Original Price ($)</label>
              <input
                type="number"
                name="originalprice"
                value={formData.originalprice}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div className="form-group half">
              <label>Discounted Price ($)</label>
              <input
                type="number"
                name="discountprice"
                value={formData.discountprice}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Start Date</label>
              <input
                type="date"
                name="startdate"
                value={formData.startdate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half">
              <label>End Date</label>
              <input
                type="date"
                name="enddate"
                value={formData.enddate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Quantity Available</label>
              <input
                type="number"
                name="quantityavailable"
                value={formData.quantityavailable}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half">
              <label>Deal Category</label>
              <select name="categoryid" value={formData.categoryid} onChange={handleChange}>
                <option value="1">Food & Drinks</option>
                <option value="2">Hotels</option>
                <option value="3">Adventures</option>
                <option value="4">Spa & Wellness</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Deal Image</label>
            <div className="image-upload-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <span className="upload-loader">Uploading...</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Or Paste Image URL</label>
            <input
              type="text"
              name="imageurl"
              value={formData.imageurl}
              onChange={handleChange}
              placeholder="Paste image link here..."
            />
            {formData.imageurl && (
              <div className="image-preview">
                <img src={formData.imageurl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting || uploading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || uploading}>
              {submitting ? "Saving..." : uploading ? "Uploading..." : deal ? "Save Changes" : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealFormModal;
