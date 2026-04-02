import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Lock, 
  History, 
  Save, 
  Shield, 
  Mail, 
  UserCircle,
  Smartphone,
  Globe,
  Monitor,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import '../styles/AdminDashboard.css';
import '../styles/AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [admin, setAdmin] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [profileRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/profile', config),
        axios.get('http://localhost:5000/api/admin/logs', config)
      ]);

      if (profileRes.data.success) {
        setAdmin(profileRes.data.admin);
        setProfileForm({ 
          username: profileRes.data.admin.username, 
          email: profileRes.data.admin.email 
        });
      }
      if (logsRes.data.success) {
        setLogs(logsRes.data.logs);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/admin/profile', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        fetchAdminData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/admin/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    }
  };

  if (loading) return <div className="admin-loading">Loading Settings...</div>;

  return (
    <div className="admin-settings-container">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Manage your administrative profile and security preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Navigation Sidebar */}
        <div className="settings-sidebar">
          <button 
            className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Profile Information</span>
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={20} />
            <span>Security & Password</span>
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <History size={20} />
            <span>Login Activity</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {message.text && (
            <div className={`settings-alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-card glassmorphism animate-fade-in">
              <div className="card-header">
                <div className="icon-wrapper blue">
                  <UserCircle size={24} />
                </div>
                <h3>Personal Information</h3>
              </div>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Username</label>
                    <div className="input-with-icon">
                      <User className="input-icon" size={18} />
                      <input 
                        type="text" 
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                        placeholder="Admin Username"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <Mail className="input-icon" size={18} />
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        placeholder="admin@dealhub.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-footer">
                  <p>Last login: {admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}</p>
                  <button type="submit" className="btn-primary">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-card glassmorphism animate-fade-in">
              <div className="card-header">
                <div className="icon-wrapper orange">
                  <Lock size={24} />
                </div>
                <h3>Security Settings</h3>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="form-footer">
                  <button type="submit" className="btn-primary">
                    <Lock size={18} /> Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="settings-card glassmorphism animate-fade-in">
              <div className="card-header">
                <div className="icon-wrapper green">
                  <History size={24} />
                </div>
                <h3>Recent Logins</h3>
              </div>
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>IP Address</th>
                      <th>Device/Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.logid}>
                        <td>
                          <div className="time-cell">
                            <Clock size={14} className="text-muted" />
                            {new Date(log.logintime).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <div className="ip-cell">
                            <Globe size={14} className="text-muted" />
                            {log.ipaddress === '::1' ? 'Localhost' : log.ipaddress}
                          </div>
                        </td>
                        <td title={log.useragent}>
                          <div className="ua-cell">
                            <Monitor size={14} className="text-muted" />
                            <span className="truncate">{log.useragent}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center py-4">No activity logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;
