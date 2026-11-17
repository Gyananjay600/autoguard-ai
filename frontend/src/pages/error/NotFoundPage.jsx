import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function NotFoundPage() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="container py-5 text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-primary mb-3"
          style={{ width: '80px', height: '80px', background: 'rgba(37, 99, 235, 0.1)', fontSize: '2.5rem' }}
        >
          <i className="bi bi-compass"></i>
        </div>
        <h1 className="display-4 fw-bold mb-2">404 — Page Not Found</h1>
        <p className="text-muted mb-4" style={{ maxWidth: '480px' }}>
          The telemetry route or resource you requested does not exist or has been relocated within the fleet command deck.
        </p>
        <div className="d-flex gap-2">
          <Link to="/dashboard" className="btn btn-dark">
            <i className="bi bi-speedometer2 me-1"></i>Return to Dashboard
          </Link>
          <Link to="/" className="btn btn-outline-secondary">
            Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
