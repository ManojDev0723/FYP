import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  MoreVertical,
  ShoppingBag,
  Star,
  ExternalLink,
  ChevronRight,
  X,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import '../styles/AdminDashboard.css';
import '../styles/AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/users`, {
        params: { role: filterRole, search: searchTerm },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const viewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/users/${user.userid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUserDetails(res.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this account?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        // Update local state
        setUsers(users.map(u => u.userid === userId ? { ...u, status: newStatus } : u));
        if (selectedUser && selectedUser.userid === userId) {
          setUserDetails({ ...userDetails, profile: { ...userDetails.profile, status: newStatus } });
        }
      }
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  return (
    <div className="admin-users-page animate-fade-in">
      {/* Search and Filters */}
      <div className="users-controls glassmorphism">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-search">Search</button>
        </form>
        
        <div className="filter-group">
          <Filter size={18} className="text-muted" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="business">Business Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card glassmorphism">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Info</th>
              <th>Role</th>
              <th>Date Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading users...</td></tr>
            ) : users.length > 0 ? (
              users.map(user => (
                <tr key={user.userid}>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-circle">
                        {user.fullname.charAt(0)}
                      </div>
                      <div>
                        <div className="user-name">{user.fullname}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'customer' ? <User size={12} /> : <ShoppingBag size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdat).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => viewUserDetails(user)}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center py-8">No users found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glassmorphism animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            {modalLoading ? (
              <div className="modal-body py-12 text-center">Loading details...</div>
            ) : userDetails ? (
              <div className="modal-body custom-scrollbar">
                {/* Profile Summary */}
                <div className="user-profile-summary">
                  <div className="profile-main">
                    <div className="large-avatar">{userDetails.profile.fullname.charAt(0)}</div>
                    <div>
                      <h4>{userDetails.profile.fullname}</h4>
                      <p className="text-muted"><Mail size={14} inline /> {userDetails.profile.email}</p>
                      <p className="text-muted"><Calendar size={14} inline /> Joined {new Date(userDetails.profile.createdat).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="profile-stats">
                    <div className="stat-box">
                      <span className="stat-label">Total Orders</span>
                      <span className="stat-val">{userDetails.stats.totalOrders}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Total Spent</span>
                      <span className="stat-val text-green">${userDetails.stats.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Reviews</span>
                      <span className="stat-val">{userDetails.stats.totalReviews}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action */}
                <div className="account-status-control">
                  <div className={`status-banner ${userDetails.profile.status}`}>
                    {userDetails.profile.status === 'active' ? 
                      <><ShieldCheck size={20} /> This account is currently active.</> : 
                      <><AlertCircle size={20} /> This account is currently suspended.</>
                    }
                  </div>
                  <button 
                    className={`btn-toggle-status ${userDetails.profile.status === 'active' ? 'suspend' : 'activate'}`}
                    onClick={() => toggleUserStatus(userDetails.profile.userid, userDetails.profile.status)}
                  >
                    {userDetails.profile.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                </div>

                {/* History Tabs */}
                <div className="modal-tabs">
                  <div className="history-section">
                    <h5><ShoppingBag size={18} /> Purchase History</h5>
                    <div className="history-list">
                      {userDetails.purchases.length > 0 ? userDetails.purchases.map(p => (
                        <div key={p.purchaseid} className="history-item">
                          <div className="history-main">
                            <h6>{p.dealTitle}</h6>
                            <span>{new Date(p.purchasedat).toLocaleDateString()}</span>
                          </div>
                          <div className="history-side">
                            <strong>${p.totalamount}</strong>
                            <span className={`status-pill ${p.paymentstatus}`}>{p.paymentstatus}</span>
                          </div>
                        </div>
                      )) : <p className="text-muted py-2">No purchases yet.</p>}
                    </div>
                  </div>

                  <div className="history-section">
                    <h5><Star size={18} /> Review History</h5>
                    <div className="history-list">
                      {userDetails.reviews.length > 0 ? userDetails.reviews.map(r => (
                        <div key={r.reviewid} className="history-item">
                          <div className="history-main">
                            <div className="rating-row">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < r.rating ? "#ffb800" : "none"} color="#ffb800" />
                              ))}
                              <h6>{r.dealTitle}</h6>
                            </div>
                            <p className="review-comment">"{r.comment}"</p>
                          </div>
                          <div className="history-side">
                            <span>{new Date(r.createdat).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )) : <p className="text-muted py-2">No reviews yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="modal-body py-12 text-center text-error">Failed to load details.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUserManagement;
