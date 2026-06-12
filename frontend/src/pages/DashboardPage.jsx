import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  /* ── Booking modal state ── */
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [bookForm, setBookForm] = useState({ quantity: "", purpose: "", startDate: "", endDate: "" });
  const [bookError, setBookError] = useState("");
  const [bookLoading, setBookLoading] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name") || "User";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    setLoading(true);
    fetch(`${BASE_URL}/api/assets`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [navigate, token]);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const deleteAsset = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    await fetch(`${BASE_URL}/api/assets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAssets((prev) => prev.filter((a) => a._id !== id));
  };

  const editAsset = async (asset) => {
    const newName = prompt("Asset name:", asset.name);
    const type = prompt("Type:", asset.type);
    const quantity = prompt("Quantity:", asset.quantity);
    const status = prompt("Status (available / booked):", asset.status);
    if (!newName || !type || !quantity || !status) return;
    const res = await fetch(`${BASE_URL}/api/assets/${asset._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName, type, quantity, status }),
    });
    const data = await res.json();
    setAssets((prev) => prev.map((a) => (a._id === asset._id ? data.asset : a)));
  };

  const openBookModal = (asset) => {
    setSelectedAsset(asset);
    setBookForm({ quantity: "", purpose: "", startDate: "", endDate: "" });
    setBookError("");
    setBookingModal(true);
  };

  const submitBooking = async () => {
    setBookError("");
    const { quantity, purpose, startDate, endDate } = bookForm;
    if (!quantity || !purpose || !startDate || !endDate) { setBookError("All fields are required."); return; }
    if (new Date(endDate) <= new Date(startDate)) { setBookError("End date must be after start date."); return; }
    setBookLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assetId: selectedAsset._id, quantity: parseInt(quantity), purpose, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) { setBookError(data.message || "Booking failed."); return; }
      setBookingModal(false);
      alert("Booking request submitted! Waiting for admin approval.");
    } catch {
      setBookError("Network error. Please try again.");
    } finally {
      setBookLoading(false);
    }
  };

  const total = assets.reduce((sum, a) => sum + (a.totalQuantity || a.quantity), 0);
  const available = assets.reduce((sum, a) => sum + (a.status === "available" ? a.quantity : 0), 0);
  const booked = total - available;

  // Search and filter
  const types = [...new Set(assets.map((a) => a.type))];
  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? a.type === filterType : true;
    return matchSearch && matchType;
  });

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
          <button className="sidebar-link active">
            <span className="sidebar-link-icon">▦</span> Dashboard
          </button>
          {role !== "admin" && (
  <>
    <button className="sidebar-link" onClick={() => navigate("/my-bookings")}>
      <span className="sidebar-link-icon">🔖</span> My Bookings
    </button>
    <button className="sidebar-link" onClick={() => navigate("/my-analytics")}>
      <span className="sidebar-link-icon">📊</span> My Analytics
    </button>
  </>
)}
          {role === "admin" && (
            <>
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
              <div className="sidebar-user-name">{name}</div>
              <div className="sidebar-user-role">{role}</div>
            </div>
          </div>
          <button className="sidebar-link" style={{ marginTop: "4px" }} onClick={handleLogout}>
            <span className="sidebar-link-icon">⎋</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-right">
            {role === "admin" && (
              <button className="btn btn-primary" onClick={() => navigate("/add-asset")}>
                + Add Asset
              </button>
            )}
          </div>
        </div>

        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">📋</div>
              <div><div className="stat-value">{total}</div><div className="stat-label">Total Assets</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">🔖</div>
              <div><div className="stat-value">{booked}</div><div className="stat-label">Active Bookings</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div><div className="stat-value">{available}</div><div className="stat-label">Available</div></div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="table-title">Assets</span>
                <span className="table-count">{filtered.length}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  className="form-input"
                  style={{ width: "200px" }}
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-input"
                  style={{ width: "150px" }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                Loading assets...
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No assets found</div>
                <div className="empty-sub">
                  {assets.length === 0
                    ? (role === "admin" ? "Add your first asset to get started." : "No assets have been added yet.")
                    : "No assets match your search."}
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => (
                    <tr key={asset._id}>
                      <td style={{ fontWeight: 500 }}>{asset.name}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{asset.type}</td>
                      <td>{asset.quantity}</td>
                      <td>
                        <span className={`badge badge-${asset.status}`}>
                          {asset.status === "available" ? "Available" : "Booked"}
                        </span>
                      </td>
                      <td>
                        <div className="action-group">
                          {role === "admin" && (
                            <>
                              <button className="btn btn-warning" onClick={() => editAsset(asset)}>Edit</button>
                              <button className="btn btn-danger" onClick={() => deleteAsset(asset._id)}>Delete</button>
                            </>
                          )}
                          {role !== "admin" && (
  <button
    className="btn btn-success"
    onClick={() => openBookModal(asset)}
    disabled={asset.status === "booked"}
    style={asset.status === "booked" ? { opacity: 0.4, cursor: "not-allowed" } : {}}
  >
    {asset.status === "booked" ? "Fully Booked" : "Request Booking"}
  </button>
)}
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

      {/* ── Booking Modal ── */}
      {bookingModal && selectedAsset && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Request Booking</h2>
              <button className="modal-close" onClick={() => setBookingModal(false)}>✕</button>
            </div>
            <div className="modal-asset-info">
              <span className="modal-asset-name">{selectedAsset.name}</span>
              <span className="modal-asset-type">{selectedAsset.type}</span>
              <span className="modal-asset-avail">{selectedAsset.quantity} available</span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="1" max={selectedAsset.quantity}
                  placeholder={`Max ${selectedAsset.quantity}`} value={bookForm.quantity}
                  onChange={(e) => setBookForm((f) => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input className="form-input" type="text" placeholder="e.g. Project presentation, Lab work..."
                  value={bookForm.purpose} onChange={(e) => setBookForm((f) => ({ ...f, purpose: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={bookForm.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={bookForm.endDate}
                    min={bookForm.startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookForm((f) => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              {bookError && <div className="form-error">{bookError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setBookingModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitBooking} disabled={bookLoading}>
                {bookLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;