import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import BASE_URL from "../api";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [bookingsPerAsset, setBookingsPerAsset] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, bpaRes, trendRes] = await Promise.all([
        fetch(`${BASE_URL}/api/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/analytics/bookings-per-asset`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/analytics/bookings-trend`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [sumData, bpaData, trendData] = await Promise.all([
        sumRes.json(), bpaRes.json(), trendRes.json(),
      ]);
      setSummary(sumData);
      setBookingsPerAsset(Array.isArray(bpaData) ? bpaData : []);
      setTrend(Array.isArray(trendData) ? trendData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = summary
    ? [
        { name: "Available", value: summary.availableQty },
        { name: "Booked", value: summary.bookedQty },
      ]
    : [];

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📦</div>
          <div>
            <div className="sidebar-logo-text">AssetFlow</div>
            <div className="sidebar-logo-sub">Management System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <button className="sidebar-link" onClick={() => navigate("/dashboard")}>
            <span className="sidebar-link-icon">▦</span> Dashboard
          </button>
          <div className="sidebar-section-label">Admin</div>
          <button className="sidebar-link" onClick={() => navigate("/approvals")}>
            <span className="sidebar-link-icon">✅</span> Approvals
          </button>
          <button className="sidebar-link" onClick={() => navigate("/allocations")}>
            <span className="sidebar-link-icon">📤</span> Allocations
          </button>
          <button className="sidebar-link" onClick={() => navigate("/users")}>
            <span className="sidebar-link-icon">👥</span> Users
          </button>
          <button className="sidebar-link active">
            <span className="sidebar-link-icon">📊</span> Analytics
          </button>
          <button className="sidebar-link" onClick={() => navigate("/audit-logs")}>
            <span className="sidebar-link-icon">📋</span> Audit Logs
          </button>
          <button className="sidebar-link" onClick={() => navigate("/add-asset")}>
            <span className="sidebar-link-icon">＋</span> Add Asset
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{role}</div>
            </div>
          </div>
          <button className="sidebar-link" style={{ marginTop: "4px" }}
            onClick={() => { localStorage.clear(); navigate("/"); }}>
            <span className="sidebar-link-icon">⎋</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">Analytics</div>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
              Loading analytics...
            </div>
          ) : (
            <>
              {/* Summary cards */}
              {summary && (
                <div className="stats-grid" style={{ marginBottom: "28px" }}>
                  <div className="stat-card">
                    <div className="stat-icon blue">📦</div>
                    <div><div className="stat-value">{summary.totalAssets}</div><div className="stat-label">Total Assets</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div><div className="stat-value">{summary.availableQty}</div><div className="stat-label">Available</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon amber">🔖</div>
                    <div><div className="stat-value">{summary.bookedQty}</div><div className="stat-label">Booked</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon blue">👥</div>
                    <div><div className="stat-value">{summary.totalUsers}</div><div className="stat-label">Total Users</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon amber">⏳</div>
                    <div><div className="stat-value">{summary.pendingBookings}</div><div className="stat-label">Pending Bookings</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div><div className="stat-value">{summary.overdueAllocations}</div><div className="stat-label">Overdue</div></div>
                  </div>
                </div>
              )}

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                {/* Bookings trend */}
                <div className="table-card" style={{ padding: "20px" }}>
                  <div className="table-title" style={{ marginBottom: "16px" }}>Bookings — Last 7 Days</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Asset availability pie */}
                <div className="table-card" style={{ padding: "20px" }}>
                  <div className="table-title" style={{ marginBottom: "16px" }}>Asset Availability</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bookings per asset bar chart */}
              {bookingsPerAsset.length > 0 && (
                <div className="table-card" style={{ padding: "20px" }}>
                  <div className="table-title" style={{ marginBottom: "16px" }}>Approved Bookings per Asset</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={bookingsPerAsset}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;