import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

const ACTION_LABELS = {
  BOOKING_APPROVED: { label: "Booking Approved", color: "#10b981" },
  BOOKING_REJECTED: { label: "Booking Rejected", color: "#ef4444" },
  ASSET_ALLOCATED: { label: "Asset Allocated", color: "#4f46e5" },
  ASSET_RETURNED: { label: "Asset Returned", color: "#f59e0b" },
  ASSET_CREATED: { label: "Asset Created", color: "#06b6d4" },
  ASSET_DELETED: { label: "Asset Deleted", color: "#ef4444" },
};

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetch(`${BASE_URL}/api/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayed = filter === "ALL" ? logs : logs.filter((l) => l.action === filter);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
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
          <button className="sidebar-link active">
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
          <div className="topbar-title">Audit Logs</div>
          <div className="topbar-right">
            <select className="form-input" style={{ width: "200px", padding: "6px 10px", fontSize: "13px" }}
              value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All Actions</option>
              {Object.entries(ACTION_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="page-body">
          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">Activity Log</span>
                <span className="table-count">{displayed.length}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                Loading...
              </div>
            ) : displayed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No logs yet</div>
                <div className="empty-sub">Actions will appear here as they happen.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Performed By</th>
                    <th>Affected User</th>
                    <th>Asset</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((log) => {
                    const meta = ACTION_LABELS[log.action] || { label: log.action, color: "#6b7280" };
                    return (
                      <tr key={log._id}>
                        <td>
                          <span style={{
                            display: "inline-block", padding: "2px 10px", borderRadius: "12px",
                            fontSize: "12px", fontWeight: 600,
                            background: meta.color + "18", color: meta.color,
                          }}>
                            {meta.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{log.performedBy?.name || "—"}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.performedBy?.email || ""}</div>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>{log.targetUser?.name || "—"}</td>
                        <td style={{ fontWeight: 500 }}>{log.asset?.name || "—"}</td>
                        <td style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "200px" }}>{log.details || "—"}</td>
                        <td style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(log.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuditLogsPage;