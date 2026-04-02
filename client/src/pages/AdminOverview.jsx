import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  TrendingUp,
  Users,
  Tag,
  Clock,
  UserPlus,
  ShoppingCart,
  Star,
  Briefcase
} from 'lucide-react';
import StatCard from '../components/StatCard';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/overview', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching admin overview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;
  if (!data) return <div className="admin-error">Failed to load dashboard data.</div>;

  const { stats, charts, recentActivity } = data;

  const COLORS = ['#00b1ff', '#53a318', '#ffb800', '#f43f5e', '#8b5cf6'];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return { icon: UserPlus, class: 'icon-user' };
      case 'deal': return { icon: Tag, class: 'icon-deal' };
      case 'review': return { icon: Star, class: 'icon-review' };
      case 'purchase': return { icon: ShoppingCart, class: 'icon-purchase' };
      default: return { icon: Briefcase, class: 'icon-user' };
    }
  };

  return (
    <div className="admin-overview">
      <div className="stats-grid">
        <StatCard
          title="Active Deals"
          value={stats.totalActiveDeals}
          icon={Tag}
          color="#00b1ff"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="#53a318"
        />
        <StatCard
          title="Registered Users"
          value={stats.totalUsers}
          icon={Users}
          color="#8b5cf6"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.totalPendingApprovals}
          icon={Clock}
          color="#ffb800"
        />
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue by Category</h3>
          <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {charts.revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Payment Methods</h3>
          <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.paymentMethodBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="paymentmethod"
                >
                  {charts.paymentMethodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.paymentmethod === 'online' ? '#00b1ff' : '#53a318'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#00b1ff' }}></div> Online
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#53a318' }}></div> Cash
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="activity-card">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((item, idx) => {
            const { icon: Icon, class: iconClass } = getActivityIcon(item.type);
            return (
              <div key={idx} className="activity-item">
                <div className={`activity-icon ${iconClass}`}>
                  <Icon size={20} />
                </div>
                <div className="activity-details" style={{ flex: 1 }}>
                  <h4>{item.title}</h4>
                  <p>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} activity</p>
                </div>
                <div className="activity-time">
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
