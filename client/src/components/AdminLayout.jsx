import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tag, 
  Store, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Ticket, 
  ListTree, 
  Clock, 
  Settings,
  Bell
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Deal Management', path: '/admin/deals', icon: Tag },
    { name: 'Business Management', path: '/admin/businesses', icon: Store },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Purchase & Revenue', path: '/admin/revenue', icon: CreditCard },
    { name: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Coupon Management', path: '/admin/coupons', icon: Ticket },
    { name: 'Category Management', path: '/admin/categories', icon: ListTree },
    { name: 'Approval Queue', path: '/admin/approvals', icon: Clock },
    { name: 'Account Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Store size={32} />
          <span>DealHub <small style={{fontSize: '0.6em', opacity: 0.7}}>ADMIN</small></span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>{navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}</h1>
              <p>Welcome back, Admin</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="btn-icon" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                <Bell size={20} color="#64748b" />
              </button>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin User</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
