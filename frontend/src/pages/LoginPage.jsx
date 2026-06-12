import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-icon">📦</div>
          <div>
            <div className="brand-logo-text">AssetFlow</div>
          </div>
        </div>
        <h1 className="brand-headline">
          Manage assets with<br /><span>complete clarity</span>
        </h1>
        <p className="brand-sub">
          Track, assign, and manage your organisation's assets from a single unified dashboard.
        </p>
        <div className="brand-stats">
          <div>
            <div className="brand-stat-value">100%</div>
            <div className="brand-stat-label">Asset Visibility</div>
          </div>
          <div>
            <div className="brand-stat-value">Real-time</div>
            <div className="brand-stat-label">Status Updates</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="accent-bar"></div>
          <h2 className="auth-title">Sign in to your account</h2>
          <p className="auth-subtitle">Enter your credentials to access the dashboard</p>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#B91C1C", borderRadius: "6px",
              padding: "10px 14px", fontSize: "13px", marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: "28px" }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
