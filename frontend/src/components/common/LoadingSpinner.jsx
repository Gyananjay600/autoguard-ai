import React from 'react';

export default function LoadingSpinner({ text = 'Loading data...', fullPage = false }) {
  if (fullPage) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-muted fw-semibold">{text}</div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center py-4 gap-2 text-muted">
      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span className="small">{text}</span>
    </div>
  );
}
