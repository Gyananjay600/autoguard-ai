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
      setErrorMessage('Password must be at least 10 characters.');
      return;
    }
    if (!hasUpper || !hasLower || !hasNumber) {
      setErrorMessage('Password requires uppercase, lowercase, and a number.');
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
    <div className="auth-viewport-wrapper">
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
          <h4 className="fw-bold mt-2 mb-0">Create Fleet Account</h4>
          <p className="text-muted small mb-0">Start monitoring your vehicles with predictive AI</p>
        </div>

        {errorMessage && (
          <FlashAlert error={errorMessage} onClose={() => setErrorMessage('')} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small fw-semibold" htmlFor="nameInput">
              Full Name
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input
                type="text"
                id="nameInput"
                className="form-control"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label small fw-semibold" htmlFor="emailInput">
              Work Email
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
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

          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label small fw-semibold" htmlFor="passwordInput">
                Password
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  id="passwordInput"
                  className="form-control"
                  placeholder="Min 10 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="col-6">
              <label className="form-label small fw-semibold" htmlFor="confirmPasswordInput">
                Confirm
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
                <input
                  type="password"
                  id="confirmPasswordInput"
                  className="form-control"
                  placeholder="Repeat pwd"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Compact Password Criteria Bar */}
          <div className="d-flex justify-content-between align-items-center p-1.5 px-2 rounded mb-3 auth-criteria-bar">
            <span className={`small ${hasLength ? 'text-success' : 'text-muted'}`}>
              <i className={`bi ${hasLength ? 'bi-check-circle-fill' : 'bi-circle'} me-0.5`}></i> 10+ chars
            </span>
            <span className={`small ${hasUpper && hasLower ? 'text-success' : 'text-muted'}`}>
              <i className={`bi ${hasUpper && hasLower ? 'bi-check-circle-fill' : 'bi-circle'} me-0.5`}></i> A-z
            </span>
            <span className={`small ${hasNumber ? 'text-success' : 'text-muted'}`}>
              <i className={`bi ${hasNumber ? 'bi-check-circle-fill' : 'bi-circle'} me-0.5`}></i> 0-9
            </span>
            <span className={`small ${isMatch ? 'text-success' : 'text-muted'}`}>
              <i className={`bi ${isMatch ? 'bi-check-circle-fill' : 'bi-circle'} me-0.5`}></i> Match
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-hero-cta w-100 py-2 mb-2.5"
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
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
