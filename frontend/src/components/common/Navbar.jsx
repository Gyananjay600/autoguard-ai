import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isEngineer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login?logout=true');
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon me-2">
            <i className="bi bi-shield-check"></i>
          </span>
          <span className="brand-text">
            AutoGuard <span className="brand-accent">AI</span>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-3"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
                <li className="nav-item">
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-speedometer2 me-1.5"></i>Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/vehicles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-car-front-fill me-1.5"></i>Fleet Garage
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/sensors/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-activity me-1.5"></i>Log Reading
                  </NavLink>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `nav-link nav-admin-badge ${isActive ? 'active' : ''}`}
                    >
                      <i className="bi bi-shield-lock me-1.5"></i>Admin Panel
                    </NavLink>
                  </li>
                )}
              </ul>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 text-white">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                      fontSize: '0.8rem'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="d-none d-sm-block text-start lh-1">
                    <div className="small fw-bold text-white">{user?.name}</div>
                    <span
                      className={`badge mt-1 ${
                        isAdmin ? 'bg-danger' : isEngineer ? 'bg-primary' : 'bg-secondary'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button onClick={handleLogout} className="btn btn-sm btn-outline-nav">
                  <i className="bi bi-box-arrow-right me-1"></i>Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-nav ms-auto gap-2 align-items-center">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <Link to="/login" className="btn btn-sm btn-outline-nav">
                <i className="bi bi-box-arrow-in-right me-1"></i>Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-dark">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
