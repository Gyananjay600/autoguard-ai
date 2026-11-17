import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FlashAlert from '../../components/common/FlashAlert';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password rules validation
  const hasLength = password.length >= 10 && password.length <= 72;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!hasLength) {
      setErrorMessage('Password must be between 10 and 72 characters.');
      return;
    }
    if (!hasUpper || !hasLower || !hasNumber) {
      setErrorMessage('Password must include uppercase, lowercase, and a number.');
      return;
    }
    if (!isMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/login?registered=true');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Registration failed.');
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
            <i className="bi bi-person-plus"></i> Fleet Onboarding
          </div>
          <h1 className="auth-hero-title">Start Protecting Your Fleet Today</h1>
          <p className="auth-hero-desc">
            Register your account to connect vehicle telemetry streams, configure custom operational alert thresholds, and unlock AI diagnostic reports.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <i className="bi bi-truck"></i>
              </div>
              <div>
                <h6>Fleet Telemetry Ingestion</h6>
                <p>Register an unlimited number of commercial or personal vehicles.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <i className="bi bi-journal-check"></i>
              </div>
              <div>
                <h6>Grounded AI Maintenance RAG</h6>
                <p>Every diagnostic is checked against official manufacturer repair guidelines.</p>
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
              New Account
            </span>
          </div>

          <h3 className="fw-bold mb-1">Create Account</h3>
          <p className="text-muted small mb-3">Join the AutoGuard AI Fleet Operations Platform</p>

          {errorMessage && (
            <FlashAlert error={errorMessage} onClose={() => setErrorMessage('')} />
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="nameInput">
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  id="nameInput"
                  className="form-control"
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="emailInput">
                Work or Personal Email
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
                  placeholder="10+ chars, uppercase, lowercase, number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password complexity checklist */}
              <div className="mt-2 d-flex flex-wrap gap-2 small">
                <span className={`badge ${hasLength ? 'bg-success' : 'bg-secondary'}`}>
                  <i className={`bi ${hasLength ? 'bi-check-lg' : 'bi-x-lg'} me-1`}></i>10+ Chars
                </span>
                <span className={`badge ${hasUpper ? 'bg-success' : 'bg-secondary'}`}>
                  <i className={`bi ${hasUpper ? 'bi-check-lg' : 'bi-x-lg'} me-1`}></i>Uppercase
                </span>
                <span className={`badge ${hasLower ? 'bg-success' : 'bg-secondary'}`}>
                  <i className={`bi ${hasLower ? 'bi-check-lg' : 'bi-x-lg'} me-1`}></i>Lowercase
                </span>
                <span className={`badge ${hasNumber ? 'bg-success' : 'bg-secondary'}`}>
                  <i className={`bi ${hasNumber ? 'bi-check-lg' : 'bi-x-lg'} me-1`}></i>Number
                </span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="confirmInput">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-shield-lock"></i>
                </span>
                <input
                  type="password"
                  id="confirmInput"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <i className="bi bi-arrow-right ms-1"></i>
                </>
              )}
            </button>

            <div className="text-center text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-info fw-bold text-decoration-none">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
