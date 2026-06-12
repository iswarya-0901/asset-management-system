import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active"); // "active" | "overdue"
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);

  /* ── Allocate modal ── */
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ assetId: "", userId: "", quantity: "", dueDate: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  /* ── Return confirm ── */
  const [returnModal, setReturnModal] = useState(null); // allocation obj
  const [condition, setCondition] = useState("Good");
  const [returnLoading, setReturnLoading] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allocRes, userRes, assetRes] = await Promise.all([
        fetch(`${BASE_URL}/api/allocations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/assets`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [allocData, userData, assetData] = await Promise.all([
        allocRes.json(), userRes.json(), assetRes.json(),
      ]);
      setAllocations(Array.isArray(allocData) ? allocData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  const displayed = allocations.filter((a) => {
    if (tab === "overdue") return isOverdue(a.dueDate);
    return true; // "active" tab shows all active (already filtered to active on backend)
  });

  const handleAllocate = async () => {
    setFormError("");
    const { assetId, userId, quantity, dueDate } = form;
    if (!assetId || !userId || !quantity || !dueDate) {
      setFormError("All fields are required.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assetId, userId, quantity: parseInt(quantity), dueDate }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      setShowModal(false);
      setForm({ assetId: "", userId: "", quantity: "", dueDate: "" });
      fetchAll();
    } catch {
      setFormError("Network error.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnModal) return;
    setReturnLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/allocations/${returnModal._id}/return`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ condition }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setReturnModal(null);
      setCondition("Good");
      fetchAll();
    } catch {
      alert("Network error.");
    } finally {
      setReturnLoading(false);
    }
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
          <button className="sidebar-link active">
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
          <div className="topbar-title">Allocations</div>
          <div className="topbar-right">
            <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(""); }}>
              + Allocate Asset
            </button>
          </div>
        </div>

        <div className="page-body">
          {/* Tabs */}
          <div className="filter-toggle" style={{ marginBottom: "20px" }}>
            <button className={`filter-btn ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>
              Active
            </button>
            <button className={`filter-btn ${tab === "overdue" ? "active" : ""}`} onClick={() => setTab("overdue")}>
              Overdue
            </button>
          </div>

          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">{tab === "overdue" ? "Overdue Allocations" : "Active Allocations"}</span>
                <span className="table-count">{displayed.length}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                Loading...
              </div>
            ) : displayed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No allocations</div>
                <div className="empty-sub">
                  {tab === "overdue" ? "No overdue allocations. All good!" : "No active allocations yet."}
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Asset</th>
                    <th>Qty</th>
                    <th>Issued</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((alloc) => (
                    <tr key={alloc._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{alloc.allocatedTo?.name || "—"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{alloc.allocatedTo?.email || ""}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{alloc.asset?.name || "—"}</td>
                      <td>{alloc.quantity}</td>
                      <td>{formatDate(alloc.issuedDate)}</td>
                      <td style={{ color: isOverdue(alloc.dueDate) ? "#e53e3e" : "inherit", fontWeight: isOverdue(alloc.dueDate) ? 600 : 400 }}>
                        {formatDate(alloc.dueDate)}
                      </td>
                      <td>
                        <div className="action-group">
                          <select
                            className="form-input"
                            style={{ width: "110px", padding: "4px 8px", fontSize: "13px" }}
                            value={alloc.condition || "Good"}
                            onChange={async (e) => {
                              // Update condition inline (optimistic)
                              setAllocations((prev) =>
                                prev.map((a) => a._id === alloc._id ? { ...a, condition: e.target.value } : a)
                              );
                            }}
                          >
                            <option>Good</option>
                            <option>Damaged</option>
                            <option>Lost</option>
                          </select>
                          <button
                            className="btn btn-success"
                            onClick={() => { setReturnModal(alloc); setCondition(alloc.condition || "Good"); }}
                          >
                            Mark Returned
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ── Allocate Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Allocate Asset</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Asset</label>
                <select className="form-input" value={form.assetId}
                  onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))}>
                  <option value="">Select asset</option>
                  {assets.filter((a) => a.quantity > 0).map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.quantity} available)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">User</label>
                <select className="form-input" value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
                  <option value="">Select user</option>
                  {users.filter((u) => u.role !== "admin").map((u) => (
                    <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="1" placeholder="e.g. 1"
                  value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
              {formError && <div className="form-error">{formError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAllocate} disabled={formLoading}>
                {formLoading ? "Allocating..." : "Allocate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return Confirm Modal ── */}
      {returnModal && (
        <div className="modal-overlay" onClick={() => setReturnModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Mark as Returned</h2>
              <button className="modal-close" onClick={() => setReturnModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Returning <strong>{returnModal.quantity} x {returnModal.asset?.name}</strong> from <strong>{returnModal.allocatedTo?.name}</strong>.
              </p>
              <div className="form-group">
                <label className="form-label">Condition on Return</label>
                <select className="form-input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option>Good</option>
                  <option>Damaged</option>
                  <option>Lost</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReturnModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleReturn} disabled={returnLoading}>
                {returnLoading ? "Processing..." : "Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllocationsPage;