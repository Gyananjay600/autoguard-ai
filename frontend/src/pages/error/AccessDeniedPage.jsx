import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function AccessDeniedPage() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="container py-5 text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-danger mb-3"
          style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '2.5rem' }}
        >
          <i className="bi bi-shield-x"></i>
        </div>
        <h1 className="display-4 fw-bold mb-2">403 — Access Denied</h1>
        <p className="text-muted mb-4" style={{ maxWidth: '480px' }}>
          Your security role does not have authorization to view or execute operations in this section of the AutoGuard AI platform.
        </p>
        <Link to="/dashboard" className="btn btn-dark">
          <i className="bi bi-arrow-left me-1"></i>Return to Dashboard
        </Link>
      </div>
      <Footer />
    </div>
  );
}
