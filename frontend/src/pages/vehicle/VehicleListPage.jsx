import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data?.vehicles || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete vehicle "${name}"? All sensor readings and history will be permanently deleted.`)) {
      return;
    }

    try {
      await api.delete(`/vehicles/${id}`);
      setSuccess(`Vehicle "${name}" deleted successfully.`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vin?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk =
        riskFilter === 'ALL' ||
        (riskFilter === 'HIGH' && v.latest_risk_level === 'HIGH') ||
        (riskFilter === 'MEDIUM' && v.latest_risk_level === 'MEDIUM') ||
        (riskFilter === 'LOW' && (v.latest_risk_level === 'LOW' || !v.latest_risk_level));

      return matchesSearch && matchesRisk;
    });
  }, [vehicles, searchTerm, riskFilter]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Loading Fleet Garage Assets..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        <FlashAlert success={success} error={error} onClose={() => { setSuccess(''); setError(''); }} />

        {/* Garage Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <div className="eyebrow mb-1"><i className="bi bi-grid-3x3-gap-fill me-1"></i>Fleet Assets</div>
            <h2 className="fw-bold mb-0">Vehicle Garage &amp; Roster</h2>
            <p className="text-muted small mb-0">
              Managing {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} with active telemetry telemetry streams.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/vehicles/new" className="btn btn-dark">
              <i className="bi bi-plus-circle me-1.5"></i>Add Vehicle
            </Link>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="card shadow-sm p-3 mb-4 bg-white border">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Filter by vehicle name, make, model, or VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex gap-1 flex-wrap">
                <button
                  type="button"
                  className={`btn btn-sm ${riskFilter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setRiskFilter('ALL')}
                >
                  All ({vehicles.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${riskFilter === 'HIGH' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setRiskFilter('HIGH')}
                >
                  High Risk
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${riskFilter === 'MEDIUM' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                  onClick={() => setRiskFilter('MEDIUM')}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${riskFilter === 'LOW' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setRiskFilter('LOW')}
                >
                  Low
                </button>
              </div>
            </div>

            <div className="col-md-3 text-md-end">
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === 'grid' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid-fill me-1"></i>Cards
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'table' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                >
                  <i className="bi bi-table me-1"></i>Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content View */}
        {filteredVehicles.length === 0 ? (
          <div className="card shadow-sm p-5 text-center">
            <div className="empty-state">
              <i className="bi bi-search"></i>
              <h5 className="fw-bold">No vehicles found</h5>
              <p className="text-muted small">No vehicles matched your search criteria or filter.</p>
              {searchTerm && (
                <button className="btn btn-outline-dark btn-sm" onClick={() => { setSearchTerm(''); setRiskFilter('ALL'); }}>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Card Grid View */
          <div className="garage-grid">
            {filteredVehicles.map((v) => (
              <div className="garage-card" key={v.id}>
                <div className="garage-card-header d-flex justify-content-between align-items-start">
                  <div>
                    <div className="garage-vehicle-make">{v.make}</div>
                    <h3 className="garage-vehicle-title">{v.name}</h3>
                    <div className="small text-light opacity-75">{v.model} • {v.year}</div>
                  </div>
                  <div>
                    {v.latest_risk_level === 'HIGH' ? (
                      <span className="badge bg-danger shadow-sm">HIGH RISK</span>
                    ) : v.latest_risk_level === 'MEDIUM' ? (
                      <span className="badge bg-warning text-dark shadow-sm">MEDIUM RISK</span>
                    ) : (
                      <span className="badge bg-success shadow-sm">LOW RISK</span>
                    )}
                  </div>
                </div>

                <div className="garage-card-body">
                  <div className="garage-spec-chips">
                    <span className="spec-chip">
                      <i className="bi bi-speedometer2"></i>
                      {v.mileage ? v.mileage.toLocaleString() + ' km' : '0 km'}
                    </span>
                    <span className="spec-chip">
                      <i className="bi bi-fuel-pump"></i>
                      {v.engine_type || 'Standard Engine'}
                    </span>
                    <span className="spec-chip">
                      <i className="bi bi-calendar-check"></i>
                      {v.year}
                    </span>
                  </div>

                  <div className="vin-box">
                    <span className="text-muted">VIN</span>
                    <code>{v.vin || 'VIN-UNASSIGNED'}</code>
                  </div>

                  {v.latest_fault_type && (
                    <div className="p-2 rounded bg-light border small">
                      <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>LAST DETECTED FAULT:</span>
                      <span className="fw-bold text-dark">{v.latest_fault_type}</span>
                    </div>
                  )}
                </div>

                <div className="garage-card-footer">
                  <div className="d-flex gap-1">
                    <Link to={`/vehicles/${v.id}/edit`} className="btn btn-sm btn-outline-secondary" title="Edit Vehicle">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(v.id, v.name)}
                      title="Delete Vehicle"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  <Link to={`/vehicles/${v.id}`} className="btn btn-sm btn-dark">
                    <i className="bi bi-cpu me-1"></i>HUD Station
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="card panel-table shadow-sm">
            <div className="card-body p-0 table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Vehicle</th>
                    <th>Make / Model</th>
                    <th>Year</th>
                    <th>Mileage</th>
                    <th>VIN</th>
                    <th>Risk State</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr key={v.id}>
                      <td className="fw-bold text-dark">
                        <Link to={`/vehicles/${v.id}`} className="text-decoration-none text-dark">
                          {v.name}
                        </Link>
                      </td>
                      <td>{v.make} {v.model}</td>
                      <td>{v.year}</td>
                      <td>{v.mileage ? v.mileage.toLocaleString() + ' km' : '0 km'}</td>
                      <td><code>{v.vin || 'N/A'}</code></td>
                      <td>
                        {v.latest_risk_level === 'HIGH' ? (
                          <span className="badge bg-danger">HIGH RISK</span>
                        ) : v.latest_risk_level === 'MEDIUM' ? (
                          <span className="badge bg-warning text-dark">MEDIUM RISK</span>
                        ) : (
                          <span className="badge bg-success">LOW RISK</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Link to={`/vehicles/${v.id}`} className="btn btn-sm btn-dark">
                            <i className="bi bi-cpu me-1"></i>HUD
                          </Link>
                          <Link to={`/vehicles/${v.id}/edit`} className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(v.id, v.name)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
