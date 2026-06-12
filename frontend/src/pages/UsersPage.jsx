import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await fetch(`${BASE_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
          <button className="sidebar-link active">
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
          <div className="topbar-title">Users</div>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div>
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">👤</div>
              <div>
                <div className="stat-value">{users.filter((u) => u.role === "user").length}</div>
                <div className="stat-label">Regular Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">🛡️</div>
              <div>
                <div className="stat-value">{users.filter((u) => u.role === "admin").length}</div>
                <div className="stat-label">Admins</div>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">All Users</span>
                <span className="table-count">{users.length}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                Loading...
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <div className="empty-title">No users yet</div>
                <div className="empty-sub">No registered users found.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: "var(--primary)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: 600, flexShrink: 0,
                          }}>
                            {u.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === "admin" ? "badge-booked" : "badge-available"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.role !== "admin" && (
                          <button className="btn btn-danger" onClick={() => handleDelete(u._id)}>
                            Delete
                          </button>
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
    </div>
  );
}

export default UsersPage;