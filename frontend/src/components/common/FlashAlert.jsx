import React from 'react';

export default function FlashAlert({ success, error, info, onClose }) {
  if (!success && !error && !info) return null;

  return (
    <div className="mb-3">
      {success && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{success}</div>
          {onClose && (
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error}</div>
          {onClose && (
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          )}
        </div>
      )}

      {info && (
        <div className="alert alert-info alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
          <i className="bi bi-info-circle-fill me-2 fs-5"></i>
          <div>{info}</div>
          {onClose && (
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          )}
        </div>
      )}
    </div>
  );
}
