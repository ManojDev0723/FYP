import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Ban,
  ShieldCheck,
  Eye,
  Plus,
  X
} from 'lucide-react';
import StatCard from '../components/StatCard';
import '../styles/AdminBusinessManagement.css';

const AdminBusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessname: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    password: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/businesses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBusinesses(response.data.businesses);
        setFilteredBusinesses(response.data.businesses);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = businesses;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(bus => 
        bus.businessname.toLowerCase().includes(lowercasedTerm) || 
        bus.fullName.toLowerCase().includes(lowercasedTerm) ||
        bus.email.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(bus => bus.computed_status === statusFilter);
    }

    setFilteredBusinesses(result);
  }, [searchTerm, statusFilter, businesses]);

  // Actions
  const handleStatusChange = async (id, action) => {
    let confirmMessage = "";
    if (action === 'suspend') confirmMessage = "Are you sure you want to suspend this business? Deals will not be able to be created.";
    if (action === 'verify') confirmMessage = "Verify this business?";
    if (action === 'activate') confirmMessage = "Reactivate this business?";
    
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/businesses/${id}/status`, 
        { action },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchBusinesses(); // Refresh
    } catch (error) {
      console.error("Error updating business status:", error);
    }
  };

  const handleViewDeals = (businessName) => {
    // Navigate to deals page and perhaps we could pass query params for filtering
    navigate(`/admin/deals`);
  };

  // Add Business Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/businesses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({
        businessname: '', fullName: '', email: '', phone: '', address: '', description: '', password: ''
      });
      fetchBusinesses();
    } catch (error) {
      console.error("Error creating business:", error);
      alert(error.response?.data?.message || "Error creating business.");
    }
  };

  if (loading) return <div className="admin-loading">Loading Businesses...</div>;

  // Stats calculation
  const totalBusinesses = businesses.length;
  const verifiedBusinesses = businesses.filter(b => b.computed_status === 'verified').length;
  const unverifiedBusinesses = businesses.filter(b => b.computed_status === 'unverified').length;
  const suspendedBusinesses = businesses.filter(b => b.computed_status === 'suspended').length;

  return (
    <div className="admin-bm-container">
      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 0 }}>
        <StatCard title="Total Businesses" value={totalBusinesses} icon={Building2} color="#00b1ff" />
        <StatCard title="Verified" value={verifiedBusinesses} icon={CheckCircle2} color="#16a34a" />
        <StatCard title="Unverified / Pending" value={unverifiedBusinesses} icon={AlertTriangle} color="#d97706" />
        <StatCard title="Suspended" value={suspendedBusinesses} icon={Ban} color="#dc2626" />
      </div>

      {/* Filter Bar */}
      <div className="admin-bm-filters">
        <div className="admin-bm-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search businesses by name, owner, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-bm-filter-group">
          <span style={{ fontSize: '0.875rem', color: '#64748b', marginRight: '0.5rem' }}>
            {filteredBusinesses.length} Results
          </span>
          <select 
            className="admin-bm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="admin-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Business</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-bm-table-wrapper">
        <table className="admin-bm-table">
          <thead>
            <tr>
              <th>Business Info</th>
              <th>Contact Details</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((bus) => (
                <tr key={bus.businessid}>
                  <td>
                    <div className="bus-cell-name">{bus.businessname}</div>
                    <div className="bus-cell-cat">{bus.category || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{bus.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{bus.email}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{bus.phone}</div>
                  </td>
                  <td>
                    <span className={`admin-badge badge-${bus.computed_status}`}>
                      {bus.computed_status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{bus.deals_posted || 0} Deals</div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(bus.createdat).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="admin-bm-actions">
                      {bus.computed_status !== 'verified' && (
                        <button 
                          className="btn-action btn-verify" 
                          title="Verify Business"
                          onClick={() => handleStatusChange(bus.businessid, 'verify')}
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}
                      <button 
                        className="btn-action btn-viewdeals" 
                        title="View Deals"
                        onClick={() => handleViewDeals(bus.businessname)}
                      >
                        <Eye size={16} />
                      </button>
                      {bus.computed_status !== 'suspended' && (
                        <button 
                          className="btn-action btn-suspend" 
                          title="Suspend Business"
                          onClick={() => handleStatusChange(bus.businessid, 'suspend')}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      {bus.computed_status === 'suspended' && (
                        <button 
                          className="btn-action btn-activate" 
                          title="Reactivate Business"
                          onClick={() => handleStatusChange(bus.businessid, 'activate')}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No businesses found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Business Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Add New Business</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Business Name *</label>
                  <input type="text" name="businessname" required value={formData.businessname} onChange={handleInputChange} />
                </div>
                
                <div className="admin-form-group">
                  <label>Owner Full Name *</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} />
                </div>
                
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Email Login *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label>Temporary Password *</label>
                    <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label>Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Business Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Create Business</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusinessManagement;
