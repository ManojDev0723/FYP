import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { Loader } from "lucide-react";
import { merchantApi } from "../services/merchantApi";
import toast from "react-hot-toast";
import "./MerchantAnalytics.css";

const MerchantAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  
  const [dateRange, setDateRange] = useState("30"); // "7", "30", "90", "all"

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersRes, dealsRes] = await Promise.all([
        merchantApi.getOrders(),
        merchantApi.getDeals()
      ]);

      setOrders(ordersRes.data || []);
      setDeals(dealsRes.data || []);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data.");
      toast.error("Error loading analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on dateRange
  const filteredOrders = useMemo(() => {
    if (dateRange === "all") return orders;
    
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - parseInt(dateRange));
    
    return orders.filter(order => {
      const orderDate = new Date(order.purchasedate);
      return orderDate >= pastDate;
    });
  }, [orders, dateRange]);

  // Derived Summary Stats
  const summaryStats = useMemo(() => {
    let totalRevenue = 0;
    const uniqueCustomers = new Set();
    const customerOrderCounts = {};
    let totalRedemptions = 0;

    filteredOrders.forEach(order => {
      totalRevenue += (order.totalamount || 0);
      
      const custId = order.userid || order.customerName || "unknown";
      uniqueCustomers.add(custId);
      
      customerOrderCounts[custId] = (customerOrderCounts[custId] || 0) + 1;
      
      if (order.redeemed) {
        totalRedemptions += 1;
      }
    });

    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    
    let repeatCustomers = 0;
    Object.values(customerOrderCounts).forEach(count => {
      if (count > 1) repeatCustomers += 1;
    });

    const conversionRate = filteredOrders.length > 0 
      ? (totalRedemptions / filteredOrders.length * 100).toFixed(1) 
      : 0;

    return {
      averageOrderValue,
      totalCustomers: uniqueCustomers.size,
      repeatCustomers,
      conversionRate
    };
  }, [filteredOrders]);

  // Daily Revenue and Vouchers (Line Chart)
  const lineChartData = useMemo(() => {
    const dailyMap = {};
    
    filteredOrders.forEach(order => {
      const dateStr = new Date(order.purchasedate).toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, revenue: 0, vouchers: 0 };
      }
      dailyMap[dateStr].revenue += (order.totalamount || 0);
      dailyMap[dateStr].vouchers += 1;
    });

    return Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredOrders]);

  // Sales by Deal (Bar Chart)
  const salesByDealData = useMemo(() => {
    const dealMap = {};
    
    filteredOrders.forEach(order => {
      const title = order.dealTitle || "Unknown Deal";
      if (!dealMap[title]) {
        dealMap[title] = { name: title, revenue: 0, count: 0 };
      }
      dealMap[title].revenue += (order.totalamount || 0);
      dealMap[title].count += 1;
    });

    return Object.values(dealMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 for bar chart
  }, [filteredOrders]);

  // Peak Redemption Hours (Bar/Heatmap substitute)
  const peakRedemptionData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Aggregate redemptions by day of week
    const data = days.map(day => ({ day, redemptions: 0 }));
    
    filteredOrders.forEach(order => {
      if (order.redeemed && order.redeemedat) {
        const d = new Date(order.redeemedat);
        const dayIdx = d.getDay();
        data[dayIdx].redemptions += 1;
      }
    });
    
    return data;
  }, [filteredOrders]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Merchant Analytics</h2>
        <div className="date-picker-controls">
          <button 
            className={`date-preset-btn ${dateRange === "7" ? 'active' : ''}`}
            onClick={() => setDateRange("7")}
          >Last 7 Days</button>
          <button 
            className={`date-preset-btn ${dateRange === "30" ? 'active' : ''}`}
            onClick={() => setDateRange("30")}
          >Last 30 Days</button>
          <button 
            className={`date-preset-btn ${dateRange === "90" ? 'active' : ''}`}
            onClick={() => setDateRange("90")}
          >3 Months</button>
          <button 
            className={`date-preset-btn ${dateRange === "all" ? 'active' : ''}`}
            onClick={() => setDateRange("all")}
          >All Time</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Average Order Value</span>
          <span className="stat-value">{formatCurrency(summaryStats.averageOrderValue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Total Customers</span>
          <span className="stat-value">{summaryStats.totalCustomers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Repeat Customers</span>
          <span className="stat-value">{summaryStats.repeatCustomers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Redemption / Conv. Rate</span>
          <span className="stat-value">{summaryStats.conversionRate}%</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* Line Chart */}
        <div className="chart-card full-width">
          <h3>Daily Revenue & Vouchers</h3>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#ff8c42" />
                <YAxis yAxisId="right" orientation="right" stroke="#4a5568" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#ff8c42" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="vouchers" name="Vouchers Sold" stroke="#4a5568" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No data for this date range.</p>
          )}
        </div>

        {/* Bar Chart - Sales By Deal */}
        <div className="chart-card">
          <h3>Sales by Deal</h3>
          {salesByDealData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByDealData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip cursor={{fill: '#ff8c4220'}} />
                <Bar dataKey="revenue" fill="#ff8c42" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No deals sold in this period.</p>
          )}
        </div>

        {/* Peak Redemption Hours (Day of Week) */}
        <div className="chart-card">
          <h3>Redemptions by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakRedemptionData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip cursor={{fill: '#ff8c4220'}} />
              <Bar dataKey="redemptions" fill="#667eea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h3>Top-Performing Deals</h3>
        {salesByDealData.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Deal Name</th>
                <th>Vouchers Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesByDealData.map((deal, index) => (
                <tr key={deal.name}>
                  <td className="rank-cell">#{index + 1}</td>
                  <td>{deal.name}</td>
                  <td>{deal.count}</td>
                  <td>{formatCurrency(deal.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sales data for this period to display leaderboard.</p>
        )}
      </div>
    </div>
  );
};

export default MerchantAnalytics;
