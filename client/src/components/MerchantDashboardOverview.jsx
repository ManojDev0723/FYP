import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Loader,
} from "lucide-react";
import { merchantApi } from "../services/merchantApi";
import toast from "react-hot-toast";
import "./MerchantDashboardOverview.css";

const MerchantDashboardOverview = () => {
  // State management
  const [merchantData, setMerchantData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Computed metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    vouchersSold: 0,
    activeDeals: 0,
    redemptionRate: 0,
    revenueMoM: 0,
    vouchersMoM: 0,
    dealsMoM: 2,
    redemptionMoM: 3.2,
  });

  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [recentRedemptions, setRecentRedemptions] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [profileRes, ordersRes, dealsRes, reviewsRes] = await Promise.all([
        merchantApi.getProfile(),
        merchantApi.getOrders(),
        merchantApi.getDeals(),
        merchantApi.getReviews(),
      ]);

      const profileData = profileRes.data;
      const ordersData = ordersRes.data || [];
      const dealsData = dealsRes.data || [];
      const reviewsData = reviewsRes.data || [];

      setMerchantData(profileData);
      setOrders(ordersData);
      setDeals(dealsData);
      setReviews(reviewsData);

      // Process orders data
      processOrdersData(ordersData);

      // Compute metrics
      computeMetrics(ordersData, dealsData);

      // Process weekly sales
      processWeeklySalesData(ordersData);

      // Get recent redemptions
      const recent = ordersData
        .slice(0, 5)
        .map((order) => ({
          id: order.couponid,
          customerName: order.customerName || "Unknown",
          dealName: order.dealTitle || "N/A",
          voucherCode: order.couponcode || "N/A",
          amount: order.discountprice || 0,
          status: order.redeemed ? "Redeemed" : "Pending",
          date: order.redeemedat
            ? new Date(order.redeemedat).toISOString().split("T")[0]
            : new Date(order.purchasedate).toISOString().split("T")[0],
        }));

      setRecentRedemptions(recent);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data. Please try again."
      );
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const computeMetrics = (ordersData, dealsData) => {
    // Total Revenue (sum of all order amounts)
    const totalRevenue = ordersData.reduce((sum, order) => {
      return sum + (order.totalamount || 0);
    }, 0);

    // Vouchers Sold (count of all orders)
    const vouchersSold = ordersData.length;

    // Active Deals (count deals with status = 'active')
    const activeDeals = dealsData.filter(
      (deal) => deal.status === "active"
    ).length;

    // Redemption Rate
    const redeemedCount = ordersData.filter((order) => order.redeemed).length;
    const redemptionRate =
      vouchersSold > 0
        ? Math.round((redeemedCount / vouchersSold) * 100)
        : 0;

    setMetrics({
      totalRevenue,
      vouchersSold,
      activeDeals,
      redemptionRate,
      revenueMoM: 12.5, // TODO: Calculate from historical data
      vouchersMoM: 8.3, // TODO: Calculate from historical data
      dealsMoM: 2,
      redemptionMoM: 3.2,
    });
  };

  const processWeeklySalesData = (ordersData) => {
    // Group orders by day of week
    const dailyData = {};
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    ordersData.forEach((order) => {
      const date = new Date(order.purchasedate);
      const dayName = daysOfWeek[date.getDay()];
      const shortDay = dayName.substring(0, 3);

      if (!dailyData[shortDay]) {
        dailyData[shortDay] = { day: shortDay, sales: 0, vouchers: 0 };
      }

      dailyData[shortDay].sales += order.totalamount || 0;
      dailyData[shortDay].vouchers += 1;
    });

    // Ensure all days are present
    const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData = allDays.map((day) => dailyData[day] || { day, sales: 0, vouchers: 0 });

    setWeeklySalesData(weekData);
  };

  const processOrdersData = (ordersData) => {
    // Transform orders for display in deals list
    // This could be used to show deal-specific metrics
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Metric card component
  const MetricCard = ({ title, value, unit, change, icon: Icon, trend }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon">{Icon}</div>
        <div className={`metric-trend ${trend}`}>
          {trend === "up" ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="metric-title">{title}</h3>
      <p className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </p>
      <p className="metric-period">vs last month</p>
    </div>
  );

  if (loading) {
    return (
      <div className="overview-loading">
        <Loader size={48} className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-error">
        <h2>⚠️ Error Loading Dashboard</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overview-container">
        {/* Metrics Section */}
        <section className="metrics-section">
          <div className="section-header">
            <h2>Performance Overview</h2>
            <p>Last 30 days summary</p>
          </div>

          <div className="metrics-grid">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              unit=""
              change={metrics.revenueMoM}
              trend="up"
              icon={<span className="icon-rupee">₨</span>}
            />
            <MetricCard
              title="Vouchers Sold"
              value={metrics.vouchersSold}
              unit=""
              change={metrics.vouchersMoM}
              trend="up"
              icon={<span className="icon-voucher">🎫</span>}
            />
            <MetricCard
              title="Active Deals"
              value={metrics.activeDeals}
              unit=""
              change={metrics.dealsMoM}
              trend="up"
              icon={<span className="icon-deals">🏷️</span>}
            />
            <MetricCard
              title="Redemption Rate"
              value={metrics.redemptionRate}
              unit="%"
              change={metrics.redemptionMoM}
              trend="up"
              icon={<span className="icon-rate">✓</span>}
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="chart-wrapper">
            <div className="chart-header">
              <h3>Weekly Sales Performance</h3>
              <span className="chart-subtitle">Revenue and vouchers sold</span>
            </div>
            {weeklySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={weeklySalesData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#999" fontSize={12} />
                  <YAxis stroke="#999" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ff8c42",
                      borderRadius: "8px",
                    }}
                    cursor={{ fill: "#ff8c4224" }}
                  />
                  <Bar dataKey="sales" fill="#ff8c42" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: "center", color: "#a0aec0" }}>
                No sales data available yet
              </p>
            )}
          </div>
        </section>

        {/* Active Deals & Redemptions Section */}
        <section className="deals-redemptions-section">
          {/* Active Deals List */}
          <div className="active-deals-wrapper">
            <div className="section-header">
              <h3>Your Active Deals</h3>
              <a href="#" className="view-all">
                View All
              </a>
            </div>

            {deals.length > 0 ? (
              <div className="deals-list">
                {deals.slice(0, 4).map((deal) => (
                  <div key={deal.dealid} className="deal-card">
                    <div className="deal-header">
                      <div className="deal-info">
                        <h4 className="deal-name">{deal.title}</h4>
                        <div className="deal-stats">
                          <span className="deal-stat">
                            <strong>
                              {orders.filter((o) => o.dealTitle === deal.title)
                                .length || 0}
                            </strong>{" "}
                            sold
                          </span>
                          <span className="deal-stat">
                            Expires {deal.enddate}
                          </span>
                        </div>
                      </div>
                      <div className="deal-right">
                        <span
                          className={`status-badge status-${deal.status.toLowerCase()}`}
                        >
                          {deal.status}
                        </span>
                      </div>
                    </div>
                    <div className="deal-footer">
                      <span className="deal-revenue">
                        Revenue:{" "}
                        {formatCurrency(
                          orders
                            .filter((o) => o.dealTitle === deal.title)
                            .reduce((sum, o) => sum + (o.totalamount || 0), 0)
                        )}
                      </span>
                      <button className="deal-action-btn">
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#a0aec0" }}>
                No deals created yet
              </p>
            )}
          </div>

          {/* Recent Redemptions Table */}
          <div className="redemptions-wrapper">
            <div className="section-header">
              <h3>Recent Voucher Redemptions</h3>
              <a href="#" className="view-all">
                View All
              </a>
            </div>

            {recentRedemptions.length > 0 ? (
              <div className="redemptions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Deal</th>
                      <th>Voucher Code</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRedemptions.map((redemption) => (
                      <tr key={redemption.id}>
                        <td>
                          <strong>{redemption.customerName}</strong>
                        </td>
                        <td>{redemption.dealName}</td>
                        <td>
                          <code className="voucher-code">
                            {redemption.voucherCode}
                          </code>
                        </td>
                        <td>{formatCurrency(redemption.amount)}</td>
                        <td>
                          <span
                            className={`status-badge status-${redemption.status.toLowerCase()}`}
                          >
                            {redemption.status}
                          </span>
                        </td>
                        <td>{redemption.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#a0aec0" }}>
                No redemptions yet
              </p>
            )}
          </div>
        </section>
      </div>
    );
  };

export default MerchantDashboardOverview;
