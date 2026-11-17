import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FlashAlert from '../../components/common/FlashAlert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const registered = searchParams.get('registered');
  const logoutParam = searchParams.get('logout');
  const expired = searchParams.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Hero Side */}
      <div className="auth-hero-side">
        <div className="d-flex align-items-center">
          <Link to="/" className="navbar-brand text-decoration-none">
            <span className="brand-icon me-2">
              <i className="bi bi-shield-check"></i>
            </span>
            <span className="brand-text fs-4 text-white">
              AutoGuard <span className="brand-accent">AI</span>
            </span>
          </Link>
        </div>

        <div className="auth-hero-content">
          <div className="auth-hero-badge">
            <i className="bi bi-broadcast"></i> IoT Telemetry Stream
          </div>
          <h1 className="auth-hero-title">Predictive Fleet Diagnostic Platform</h1>
          <p className="auth-hero-desc">
            Connect high-frequency vehicle sensors with real-time generative diagnostics. Protect your fleet from reactive breakdown downtime.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <i className="bi bi-cpu"></i>
              </div>
              <div>
                <h6>Real-time Telemetry Ingestion</h6>
                <p>Streaming continuous RPM, thermal, oil pressure, and vibration metrics.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <i className="bi bi-search"></i>
              </div>
              <div>
                <h6>Dual-Mode AI Assessment</h6>
                <p>Switch dynamically between Rapid Health Scoring and Deep RAG Diagnostics.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <i className="bi bi-shield-lock"></i>
              </div>
              <div>
                <h6>Role-Scoped Fleet Access</h6>
                <p>Granular isolation between Owner, Engineer, and Admin command decks.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-light small opacity-75">
          &copy; {new Date().getFullYear()} AutoGuard AI Platform. All rights reserved.
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25">
              Secure Access
            </span>
          </div>

          <h3 className="fw-bold mb-1">Welcome back</h3>
          <p className="text-muted small mb-3">Sign in to your AutoGuard command center</p>

          {registered && (
            <FlashAlert success="Account created successfully! Please sign in with your credentials." />
          )}
          {logoutParam && (
            <FlashAlert info="You have been signed out safely." />
          )}
          {expired && (
            <FlashAlert error="Your session has expired. Please sign in again." />
          )}
          {errorMessage && (
            <FlashAlert error={errorMessage} onClose={() => setErrorMessage('')} />
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="emailInput">
                Email address
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  id="emailInput"
                  className="form-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="passwordInput">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  id="passwordInput"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-auth-submit w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <i className="bi bi-arrow-right ms-1"></i>
                </>
              )}
            </button>

            <div className="text-center text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="text-info fw-bold text-decoration-none">
                Register here
              </Link>
            </div>
          </form>

          {/* Quick Demo Credentials Tip */}
          <div className="mt-3 p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 small text-muted">
            <span className="text-info fw-bold">Demo Accounts:</span>
            <div className="mt-1">
              Admin: <code>admin@autoguard.ai</code> (Pwd: <code>Password@1234</code>)<br />
              Driver: <code>driver@autoguard.ai</code> (Pwd: <code>Password@1234</code>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
