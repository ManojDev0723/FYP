import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{title}</span>
        {Icon && <Icon size={20} style={{ color: color || 'var(--admin-primary)' }} />}
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
};

export default StatCard;
