import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import FlashAlert from '../../components/common/FlashAlert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const registered = searchParams.get('registered');
  const logoutParam = searchParams.get('logout');
  const expired = searchParams.get('expired');

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@1234');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-viewport-wrapper">
      {/* Background ambient lighting */}
      <div className="auth-ambient-orb auth-orb-1"></div>
      <div className="auth-ambient-orb auth-orb-2"></div>

      <div className="auth-card-compact">
        {/* Brand Header */}
        <div className="text-center mb-3">
          <Link to="/" className="d-inline-flex align-items-center text-decoration-none">
            <span className="brand-logo-icon me-2">
              <i className="bi bi-shield-check"></i>
            </span>
            <span className="fs-4 fw-bold">
              AutoGuard<span className="brand-ai-badge ms-1">AI</span>
            </span>
          </Link>
          <h4 className="fw-bold mt-2 mb-0">Welcome Back</h4>
          <p className="text-muted small mb-0">Sign in to your fleet command center</p>
        </div>

        {/* Alerts */}
        {registered && (
          <FlashAlert success="Account created successfully! Please sign in." />
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

        {/* Quick 1-Click Demo Buttons */}
        <div className="auth-demo-strip mb-3">
          <div className="d-flex align-items-center justify-content-between mb-1.5">
            <span className="auth-demo-label">
              <i className="bi bi-lightning-charge-fill text-warning me-1"></i>Demo Accounts:
            </span>
            <span className="auth-demo-pwd">Password@1234</span>
          </div>
          <div className="d-flex gap-1.5">
            <button
              type="button"
              className="btn btn-sm auth-demo-btn flex-fill"
              onClick={() => fillDemo('admin@autoguard.ai')}
            >
              <i className="bi bi-shield-lock text-danger me-1"></i>Admin
            </button>
            <button
              type="button"
              className="btn btn-sm auth-demo-btn flex-fill"
              onClick={() => fillDemo('engineer@autoguard.ai')}
            >
              <i className="bi bi-tools text-primary me-1"></i>Engineer
            </button>
            <button
              type="button"
              className="btn btn-sm auth-demo-btn flex-fill"
              onClick={() => fillDemo('driver@autoguard.ai')}
            >
              <i className="bi bi-person text-success me-1"></i>Driver
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-2.5">
            <label className="form-label small fw-semibold" htmlFor="emailInput">
              Email Address
            </label>
            <div className="input-group input-group-sm">
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
            <label className="form-label small fw-semibold" htmlFor="passwordInput">
              Password
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                id="passwordInput"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-hero-cta w-100 py-2 mb-2.5"
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
      </div>
    </div>
  );
}
