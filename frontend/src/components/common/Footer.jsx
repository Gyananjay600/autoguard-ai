import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="app-footer-inner">
          <Link to="/" className="footer-brand">
            <i className="bi bi-shield-check fs-5"></i>
            <span>AutoGuard AI</span>
          </Link>
          <div className="small text-muted text-center text-md-start">
            &copy; {new Date().getFullYear()} AutoGuard AI Platform. Intelligent Predictive Fleet Diagnostics &amp; RAG.
          </div>
          <div className="footer-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/vehicles">Garage</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <i className="bi bi-github me-1"></i>Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
