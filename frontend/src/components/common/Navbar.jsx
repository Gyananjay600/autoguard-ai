import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login?logout=true');
  };

  return (
    <header className="app-navbar-sticky">
      <nav className="navbar navbar-expand-lg app-navbar-inner">
        <div className="container-fluid px-3 px-lg-4">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand-modern">
            <span className="brand-logo-icon">
              <i className="bi bi-shield-check"></i>
            </span>
            <span className="brand-title">
              AutoGuard<span className="brand-ai-badge">AI</span>
            </span>
          </Link>

          {/* Mobile Right Controls: Theme Toggle & Hamburger */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <button
              onClick={toggleTheme}
              className="navbar-theme-btn"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <i className="bi bi-sun-fill text-warning"></i>
              ) : (
                <i className="bi bi-moon-stars-fill text-primary"></i>
              )}
            </button>

            <button
              className="navbar-toggler-modern"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list"></i>
            </button>
          </div>

          {/* Navigation Links and User Action Decks */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {isAuthenticated ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
                  <li className="nav-item">
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}
                    >
                      <i className="bi bi-speedometer2"></i>
                      <span>Dashboard</span>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to="/vehicles"
                      className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}
                    >
                      <i className="bi bi-car-front-fill"></i>
                      <span>Fleet Garage</span>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to="/sensors/upload"
                      className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}
                    >
                      <i className="bi bi-activity"></i>
                      <span>Log Reading</span>
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink
                        to="/admin"
                        className={({ isActive }) => `nav-link-modern admin-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-shield-lock-fill"></i>
                        <span>Admin</span>
                      </NavLink>
                    </li>
                  )}
                </ul>

                <div className="d-flex align-items-center gap-2.5 mt-3 mt-lg-0">
                  {/* Desktop Theme Switcher */}
                  <button
                    onClick={toggleTheme}
                    className="navbar-theme-btn d-none d-lg-flex"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label="Toggle theme"
                  >
                    {isDark ? (
                      <i className="bi bi-sun-fill text-warning"></i>
                    ) : (
                      <i className="bi bi-moon-stars-fill text-primary"></i>
                    )}
                  </button>

                  {/* User Profile Pill */}
                  <div className="navbar-user-chip">
                    <div className="user-avatar-circle">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-meta-info d-none d-md-block">
                      <div className="user-meta-name">{user?.name || 'Operator'}</div>
                      <span className={`user-meta-role role-${(user?.role || 'DRIVER').toLowerCase()}`}>
                        {user?.role || 'DRIVER'}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button onClick={handleLogout} className="btn-navbar-logout" title="Sign Out">
                    <i className="bi bi-box-arrow-right"></i>
                    <span className="d-none d-md-inline ms-1">Exit</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="navbar-nav ms-auto gap-2 align-items-center mt-3 mt-lg-0">
                <NavLink to="/" className={({ isActive }) => `nav-link-modern ${isActive ? 'active' : ''}`}>
                  <span>Home</span>
                </NavLink>

                {/* Desktop Theme Switcher */}
                <button
                  onClick={toggleTheme}
                  className="navbar-theme-btn d-none d-lg-flex"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <i className="bi bi-sun-fill text-warning"></i>
                  ) : (
                    <i className="bi bi-moon-stars-fill text-primary"></i>
                  )}
                </button>

                <Link to="/login" className="btn-navbar-secondary">
                  <i className="bi bi-box-arrow-in-right me-1"></i>Sign In
                </Link>
                <Link to="/register" className="btn-navbar-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
