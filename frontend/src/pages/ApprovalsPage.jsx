import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function ApprovalsPage() {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetchBookings();
  }, [filter]);

  const fetchBookings = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/bookings/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        setAllBookings(all); // always store full list for stats
        setBookings(filter === "pending" ? all.filter((b) => b.status === "pending") : all);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setAllBookings((prev) =>
  prev.map((b) => b._id === bookingId ? { ...b, status: "approved" } : b)
);
setBookings((prev) =>
  filter === "pending"
    ? prev.filter((b) => b._id !== bookingId)
    : prev.map((b) => b._id === bookingId ? { ...b, status: "approved" } : b)
);
    } catch { alert("Network error."); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      const res = await fetch(`${BASE_URL}/api/bookings/${rejectModal}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setAllBookings((prev) =>
  prev.map((b) => b._id === rejectModal ? { ...b, status: "rejected", rejectionReason: rejectReason } : b)
);
setBookings((prev) =>
  filter === "pending"
    ? prev.filter((b) => b._id !== rejectModal)
    : prev.map((b) => b._id === rejectModal ? { ...b, status: "rejected", rejectionReason: rejectReason } : b)
);
      setRejectModal(null);
      setRejectReason("");
    } catch { alert("Network error."); }
    finally { setActionLoading(null); }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const statusBadgeClass = (status) => {
    if (status === "approved") return "badge badge-available";
    if (status === "rejected") return "badge badge-booked";
    return "badge badge-pending";
  };

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
          <button className="sidebar-link active">
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
          <div className="topbar-title">Booking Approvals</div>
          <div className="topbar-right">
            <div className="filter-toggle">
              <button className={`filter-btn ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>
                Pending
              </button>
              <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                All Requests
              </button>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-icon amber">⏳</div>
              <div><div className="stat-value">{allBookings.filter((b) => b.status === "pending").length}</div><div className="stat-label">Pending</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div><div className="stat-value">{allBookings.filter((b) => b.status === "approved").length}</div><div className="stat-label">Approved</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">✕</div>
              <div><div className="stat-value">{allBookings.filter((b) => b.status === "rejected").length}</div><div className="stat-label">Rejected</div></div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">{filter === "pending" ? "Pending Requests" : "All Requests"}</span>
                <span className="table-count">{bookings.length}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <div className="empty-title">{filter === "pending" ? "No pending requests" : "No booking requests yet"}</div>
                <div className="empty-sub">{filter === "pending" ? "All caught up!" : "Users haven't requested any assets yet."}</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Requested By</th>
                    <th>Qty</th>
                    <th>Purpose</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 500 }}>{b.asset?.name || "—"}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.bookedBy?.name || "—"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{b.bookedBy?.email || ""}</div>
                      </td>
                      <td>{b.quantity}</td>
                      <td style={{ color: "var(--text-secondary)", maxWidth: "160px" }}>{b.purpose}</td>
                      <td>{formatDate(b.startDate)}</td>
                      <td>{formatDate(b.endDate)}</td>
                      <td><span className={statusBadgeClass(b.status)}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></td>
                      <td>
                        {b.status === "pending" ? (
                          <div className="action-group">
                            <button className="btn btn-success" onClick={() => handleApprove(b._id)} disabled={actionLoading === b._id}>
                              {actionLoading === b._id ? "..." : "Approve"}
                            </button>
                            <button className="btn btn-danger" onClick={() => { setRejectModal(b._id); setRejectReason(""); }} disabled={actionLoading === b._id}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {b.rejectionReason ? `Reason: ${b.rejectionReason}` : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Booking</h2>
              <button className="modal-close" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <input className="form-input" type="text" placeholder="e.g. Asset under maintenance..."
                  value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading === rejectModal}>
                {actionLoading === rejectModal ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalsPage;