import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/api/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusBadgeClass = (status) => {
    if (status === "approved") return "badge badge-available";
    if (status === "rejected") return "badge badge-booked";
    return "badge badge-pending";
  };

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
  {role !== "admin" && (
    <button className="sidebar-link active">
      <span className="sidebar-link-icon">🔖</span> My Bookings
    </button>
  )}
  {role === "admin" && (
    <>
      <button className="sidebar-link active">
        <span className="sidebar-link-icon">🔖</span> My Bookings
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
      <button className="sidebar-link" onClick={() => navigate("/analytics")}>
        <span className="sidebar-link-icon">📊</span> Analytics
      </button>
      <button className="sidebar-link" onClick={() => navigate("/audit-logs")}>
        <span className="sidebar-link-icon">📋</span> Audit Logs
      </button>
      <button className="sidebar-link" onClick={() => navigate("/add-asset")}>
        <span className="sidebar-link-icon">＋</span> Add Asset
      </button>
    </>
  )}
</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{role}</div>
            </div>
          </div>
          <button
            className="sidebar-link"
            style={{ marginTop: "4px" }}
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            <span className="sidebar-link-icon">⎋</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">My Bookings</div>
        </div>

        <div className="page-body">
          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">Booking Requests</span>
                <span className="table-count">{bookings.length}</span>
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                }}
              >
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔖</div>
                <div className="empty-title">No booking requests yet</div>
                <div className="empty-sub">
                  Head to the dashboard to request an asset.
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => navigate("/dashboard")}
                >
                  Browse Assets
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Purpose</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 500 }}>
                        {b.asset?.name || "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {b.asset?.type || "—"}
                      </td>
                      <td>{b.quantity}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {b.purpose}
                      </td>
                      <td>{formatDate(b.startDate)}</td>
                      <td>{formatDate(b.endDate)}</td>
                      <td>
                        <span className={statusBadgeClass(b.status)}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                        {b.rejectionReason || "—"}
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

export default MyBookings;