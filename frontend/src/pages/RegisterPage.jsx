import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, { name, email, password });
      setSuccess(res.data.message + " — Redirecting to login...");
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-icon">📦</div>
          <div>
            <div className="brand-logo-text">AssetFlow</div>
          </div>
        </div>
        <h1 className="brand-headline">
          Join your team's<br /><span>asset workspace</span>
        </h1>
        <p className="brand-sub">
          Create your account to start tracking and managing assets across your organisation.
        </p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="accent-bar"></div>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#B91C1C", borderRadius: "6px",
              padding: "10px 14px", fontSize: "13px", marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              color: "#166534", borderRadius: "6px",
              padding: "10px 14px", fontSize: "13px", marginBottom: "20px"
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Choose a strong password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: "28px" }}>
            Already have an account? <Link to="/">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
