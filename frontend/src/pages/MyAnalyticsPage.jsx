import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function MyAnalyticsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "User";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    fetch(`${BASE_URL}/api/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const approved = bookings.filter((b) => b.status === "approved").length;
  const rejected = bookings.filter((b) => b.status === "rejected").length;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  }) : "—";

  return (
    <div className="app-layout">
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
          <button className="sidebar-link" onClick={() => navigate("/my-bookings")}>
            <span className="sidebar-link-icon">🔖</span> My Bookings
          </button>
          <button className="sidebar-link active">
            <span className="sidebar-link-icon">📊</span> My Analytics
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{name}</div>
              <div className="sidebar-user-role">{role}</div>
            </div>
          </div>
          <button className="sidebar-link" style={{ marginTop: "4px" }}
            onClick={() => { localStorage.clear(); navigate("/"); }}>
            <span className="sidebar-link-icon">⎋</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">My Analytics</div>
        </div>
        <div className="page-body">
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-icon blue">📋</div>
              <div><div className="stat-value">{bookings.length}</div>
              <div className="stat-label">Total Requests</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div><div className="stat-value">{approved}</div>
              <div className="stat-label">Approved</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">⏳</div>
              <div><div className="stat-value">{pending}</div>
              <div className="stat-label">Pending</div></div>
            </div>
          </div>

          {/* Booking history table */}
          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">My Booking History</span>
                <span className="table-count">{bookings.length}</span>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Loading...
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div className="empty-title">No bookings yet</div>
                <div className="empty-sub">Your booking history will appear here.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Qty</th>
                    <th>Purpose</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 500 }}>{b.asset?.name || "—"}</td>
                      <td>{b.quantity}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{b.purpose}</td>
                      <td>{formatDate(b.startDate)}</td>
                      <td>{formatDate(b.endDate)}</td>
                      <td>
                        <span className={
                          b.status === "approved" ? "badge badge-available" :
                          b.status === "rejected" ? "badge badge-booked" :
                          "badge badge-pending"
                        }>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyAnalyticsPage;