import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/merchants/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (couponId, currentRedeemed) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/merchants/orders/${couponId}/redeem`,
        { redeemed: !currentRedeemed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.couponid === couponId 
            ? { 
                ...order, 
                redeemed: !currentRedeemed ? 1 : 0, 
                status: !currentRedeemed ? 'Redeemed' : 'Purchased',
                redeemedat: !currentRedeemed ? new Date().toISOString() : null
              } 
            : order
        )
      );
    } catch (err) {
      console.error("Error redeeming coupon:", err);
      alert("Failed to update redemption status.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.couponcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dealTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = !dateFilter || new Date(order.purchasedate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) return <div className="order-loader-container"><div className="order-loader"></div></div>;

  return (
    <div className="order-mgmt-wrapper">
      <div className="order-mgmt-header">
        <div className="header-text">
          <h1>Order & Coupon Management</h1>
          <p>Track customer purchases and validate coupons in real-time.</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{orders.filter(o => o.status === 'Purchased').length}</span>
          </div>
        </div>
      </div>

      <div className="order-controls-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Search by Code, Customer, or Deal..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-select">
            <option value="all">All Statuses</option>
            <option value="purchased">Purchased</option>
            <option value="redeemed">Redeemed</option>
            <option value="expired">Expired</option>
          </select>

          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)} 
            className="date-input"
          />
          
          <button className="refresh-btn" onClick={fetchOrders} title="Refresh Data">
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>
      </div>

      {error && <div className="order-error-alert">{error}</div>}

      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Code / QR</th>
              <th>Customer</th>
              <th>Deal Info</th>
              <th>Purchased On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.couponid} className={`order-row ${order.status.toLowerCase()}`}>
                  <td className="col-code">
                    <span className="coupon-code-pill">{order.couponcode}</span>
                    <small className="qr-hint"><i className="fa-solid fa-qrcode"></i> Scan-ready</small>
                  </td>
                  <td className="col-customer">
                    <div className="customer-info">
                      <strong>{order.customerName}</strong>
                    </div>
                  </td>
                  <td className="col-deal">
                    <span className="deal-title-text">{order.dealTitle}</span>
                    {order.quantity > 1 && <span className="qty-tag">x{order.quantity}</span>}
                  </td>
                  <td className="col-date">
                    {new Date(order.purchasedate).toLocaleDateString()}
                  </td>
                  <td className="col-status">
                    <span className={`status-pill ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="col-action">
                    {order.status === 'Purchased' ? (
                      <button 
                        className="redeem-action-btn"
                        onClick={() => handleRedeem(order.couponid, false)}
                      >
                        Redeem Now
                      </button>
                    ) : order.status === 'Redeemed' ? (
                      <button 
                        className="unredeem-action-btn"
                        onClick={() => handleRedeem(order.couponid, true)}
                      >
                        Undo
                      </button>
                    ) : (
                      <span className="no-action-text">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-table-msg">
                  <i className="fa-solid fa-inbox"></i>
                  <p>No orders found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
