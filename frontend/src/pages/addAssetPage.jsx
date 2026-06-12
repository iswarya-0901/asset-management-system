import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../api";

function AddAssetPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${BASE_URL}/api/assets/add`,
        { name, type, quantity },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add asset.");
    } finally {
      setLoading(false);
    }
  };

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("name") || "User";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

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
    <button className="sidebar-link" onClick={() => navigate("/my-bookings")}>
      <span className="sidebar-link-icon">🔖</span> My Bookings
    </button>
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
      <button className="sidebar-link active">
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
          <button className="sidebar-link" style={{ marginTop: "4px" }}
            onClick={() => { localStorage.clear(); navigate("/"); }}>
            <span className="sidebar-link-icon">⎋</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">Add Asset</div>
          <div className="topbar-right">
            <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="page-body">
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-title">New Asset</div>
              <div className="form-card-sub">Fill in the details to register a new asset</div>
            </div>

            <div className="form-card-body">
              {error && (
                <div style={{
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  color: "#B91C1C", borderRadius: "6px",
                  padding: "10px 14px", fontSize: "13px", marginBottom: "20px"
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. MacBook Pro 14-inch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type / Category</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Laptop, Projector, Vehicle"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="1"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-card-footer" style={{ margin: "0 -28px -28px", borderTop: "1px solid var(--border)", padding: "16px 28px" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Asset"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddAssetPage;
