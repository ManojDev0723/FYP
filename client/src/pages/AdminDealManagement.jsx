import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XSquare,
  Tag,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import StatCard from '../components/StatCard';
import '../styles/AdminDealManagement.css';

const AdminDealManagement = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingDealId, setEditingDealId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    businessid: '',
    categoryid: '1',
    title: '',
    description: '',
    originalprice: '',
    discountprice: '',
    startdate: '',
    enddate: '',
    quantityavailable: '',
    imageurl: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDeals();
    fetchBusinesses();
  }, []);

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDeals(response.data.deals);
        setFilteredDeals(response.data.deals);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/businesses/simple', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBusinesses(response.data.businesses);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    let result = deals;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(deal => 
        deal.title.toLowerCase().includes(lowercasedTerm) || 
        (deal.business_name && deal.business_name.toLowerCase().includes(lowercasedTerm))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(deal => deal.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(deal => deal.categoryid.toString() === categoryFilter);
    }

    setFilteredDeals(result);
  }, [searchTerm, statusFilter, categoryFilter, deals]);

  // Actions
  const handleStatusToggle = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/deals/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchDeals(); // Refresh
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDeals();
    } catch (error) {
      console.error("Error deleting deal:", error);
    }
  };

  // Modal Handlers
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      businessid: businesses.length > 0 ? businesses[0].businessid : '',
      categoryid: '1',
      title: '',
      description: '',
      originalprice: '',
      discountprice: '',
      startdate: new Date().toISOString().split('T')[0],
      enddate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      quantityavailable: '100',
      imageurl: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (deal) => {
    setModalMode('edit');
    setEditingDealId(deal.dealid);
    setFormData({
      businessid: deal.businessid,
      categoryid: deal.categoryid,
      title: deal.title,
      description: deal.description || '',
      originalprice: deal.originalprice,
      discountprice: deal.discountprice,
      startdate: new Date(deal.startdate).toISOString().split('T')[0],
      enddate: new Date(deal.enddate).toISOString().split('T')[0],
      quantityavailable: deal.quantityavailable,
      imageurl: deal.imageurl || '',
      status: deal.status
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDealId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (modalMode === 'add') {
        await axios.post('http://localhost:5000/api/admin/deals', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`http://localhost:5000/api/admin/deals/${editingDealId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
      fetchDeals();
    } catch (error) {
      console.error("Error saving deal:", error);
      alert("Error saving deal. Please try again.");
    }
  };

  if (loading) return <div className="admin-loading">Loading Deals...</div>;

  // Stats calculation
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.status === 'active').length;
  const pendingDeals = deals.filter(d => d.status === 'inactive').length;
  const expiredDeals = deals.filter(d => d.status === 'expired').length;

  // Unique categories for filter
  const uniqueCategories = [...new Set(deals.map(d => ({ id: d.categoryid, name: d.category_name })))].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);

  return (
    <div className="admin-dm-container">
      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 0 }}>
        <StatCard title="Total Deals" value={totalDeals} icon={Tag} color="#1e293b" />
        <StatCard title="Active Deals" value={activeDeals} icon={CheckCircle} color="#16a34a" />
        <StatCard title="Pending / Inactive" value={pendingDeals} icon={Clock} color="#d97706" />
        <StatCard title="Expired" value={expiredDeals} icon={AlertCircle} color="#dc2626" />
      </div>

      {/* Filter Bar */}
      <div className="admin-dm-filters">
        <div className="admin-dm-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search deals by title or business..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-dm-filter-group">
          <select 
            className="admin-dm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive / Pending</option>
            <option value="expired">Expired</option>
          </select>
          <select 
            className="admin-dm-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
             <option key={cat.id} value={cat.id}>
                 {cat.name || `Category ${cat.id}`}
             </option>
            ))}
          </select>
          <button className="admin-btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add New Deal</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-dm-table-wrapper">
        <table className="admin-dm-table">
          <thead>
            <tr>
              <th>Deal Info</th>
              <th>Category</th>
              <th>Price & Discount</th>
              <th>Status</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => {
                const discountPercentage = Math.round(((deal.originalprice - deal.discountprice) / deal.originalprice) * 100) || 0;
                
                return (
                  <tr key={deal.dealid}>
                    <td>
                      <div className="deal-cell-title">{deal.title}</div>
                      <div className="deal-cell-business">{deal.business_name || 'Platform Deal'}</div>
                    </td>
                    <td>{deal.category_name || `ID: ${deal.categoryid}`}</td>
                    <td>
                      <div>
                        <span className="deal-price-original">${Number(deal.originalprice).toFixed(2)}</span>
                        <span className="deal-price-discount">${Number(deal.discountprice).toFixed(2)}</span>
                        <span className="deal-discount-badge">{discountPercentage}% OFF</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge badge-${deal.status}`}>{deal.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(deal.startdate).toLocaleDateString()} - <br/>
                      {new Date(deal.enddate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="admin-dm-actions">
                        {deal.status !== 'active' && (
                          <button 
                            className="btn-action btn-approve" 
                            title="Activate Deal"
                            onClick={() => handleStatusToggle(deal.dealid, 'active')}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {deal.status === 'active' && (
                          <button 
                            className="btn-action btn-deactivate" 
                            title="Deactivate Deal"
                            onClick={() => handleStatusToggle(deal.dealid, 'inactive')}
                          >
                            <XSquare size={16} />
                          </button>
                        )}
                        <button 
                          className="btn-action btn-edit" 
                          title="Edit Deal"
                          onClick={() => openEditModal(deal)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-action btn-delete" 
                          title="Delete Deal"
                          onClick={() => handleDelete(deal.dealid)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No deals found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>{modalMode === 'add' ? 'Add New Deal' : 'Edit Deal'}</h2>
              <button className="admin-modal-close" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g. 50% Off Spa Treatment" />
                </div>
                
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Deal details..."></textarea>
                </div>
                
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Business</label>
                    <select name="businessid" required value={formData.businessid} onChange={handleInputChange}>
                      <option value="">Select a Business</option>
                      {businesses.map(b => (
                        <option key={b.businessid} value={b.businessid}>{b.businessname}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Category ID</label>
                    <input type="number" name="categoryid" required value={formData.categoryid} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Original Price ($)</label>
                    <input type="number" step="0.01" name="originalprice" required value={formData.originalprice} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label>Discount Price ($)</label>
                    <input type="number" step="0.01" name="discountprice" required value={formData.discountprice} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Start Date</label>
                    <input type="date" name="startdate" required value={formData.startdate} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label>End Date</label>
                    <input type="date" name="enddate" required value={formData.enddate} onChange={handleInputChange} />
                  </div>
                </div>
                
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Quantity Available</label>
                    <input type="number" name="quantityavailable" required value={formData.quantityavailable} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Image URL</label>
                  <input type="text" name="imageurl" value={formData.imageurl} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn-primary">
                  {modalMode === 'add' ? 'Create Deal' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDealManagement;
