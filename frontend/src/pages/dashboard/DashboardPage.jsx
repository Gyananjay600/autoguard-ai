import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [simRunning, setSimRunning] = useState(false);
  const [simLoading, setSimLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimStatus = async () => {
    try {
      const res = await api.get('/simulator/status');
      setSimRunning(res.data?.isRunning || false);
    } catch (err) {
      console.warn('Could not query simulator status:', err.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchSimStatus();
  }, []);

  const handleToggleSimulator = async () => {
    setSimLoading(true);
    try {
      const nextState = !simRunning;
      const res = await api.post('/simulator/toggle', { enable: nextState });
      setSimRunning(res.data?.isRunning);
      setSuccess(res.data?.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle simulator.');
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Connecting to Fleet Telemetry Stream..." />
        <Footer />
      </div>
    );
  }

  const summary = data?.summary || { totalVehicles: 0, highRiskCount: 0, mediumRiskCount: 0, lowRiskCount: 0, totalAlerts: 0 };
  const vehicles = data?.vehicles || [];
  const showingAllVehicles = data?.showingAllVehicles;

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        <FlashAlert success={success} error={error} onClose={() => { setSuccess(''); setError(''); }} />

        {/* Hero Welcome Banner */}
        <section className="welcome-banner fleet-hero mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="eyebrow"><i className="bi bi-broadcast me-1.5"></i>Command Center</div>
              <h1 className="mb-2">Protect every journey, <span>{user?.name || 'Driver'}</span>.</h1>
              <p className="mb-0 text-light opacity-85">
                {showingAllVehicles
                  ? 'You are viewing telemetry across all active fleet assets.'
                  : 'Your dashboard includes vehicles registered to your personal account.'}
              </p>
            </div>
            <div className="hero-actions d-flex gap-2 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm ${simRunning ? 'btn-danger' : 'btn-success'}`}
                onClick={handleToggleSimulator}
                disabled={simLoading}
              >
                <i className={`bi ${simRunning ? 'bi-stop-circle' : 'bi-play-circle'} me-1`}></i>
                {simRunning ? 'Pause Simulator' : 'Start 30s Simulator'}
              </button>
              <Link to="/vehicles/new" className="btn btn-light fw-semibold">
                <i className="bi bi-plus-circle me-1.5"></i>Add Vehicle
              </Link>
              <Link to="/sensors/upload" className="btn btn-hero-outline">
                <i className="bi bi-activity me-1.5"></i>Log Reading
              </Link>
            </div>
          </div>
        </section>

        {/* Summary Cards Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="section-kicker"><i className="bi bi-grid-fill me-1"></i>Fleet Overview</span>
          <span className="scope-badge">
            {showingAllVehicles ? 'Fleet Team View' : 'My Vehicles'}
          </span>
        </div>

        {/* Metric Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card metric-card metric-total h-100">
              <div className="card-body d-flex justify-content-between align-items-start p-3 p-md-4">
                <div>
                  <div className="metric-label">Total Vehicles</div>
                  <div className="metric-value">{summary.totalVehicles}</div>
                </div>
                <span className="metric-icon"><i className="bi bi-truck"></i></span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card metric-card metric-high h-100">
              <div className="card-body d-flex justify-content-between align-items-start p-3 p-md-4">
                <div>
                  <div className="metric-label">High Risk</div>
                  <div className="metric-value">{summary.highRiskCount}</div>
                </div>
                <span className="metric-icon"><i className="bi bi-exclamation-triangle"></i></span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card metric-card metric-medium h-100">
              <div className="card-body d-flex justify-content-between align-items-start p-3 p-md-4">
                <div>
                  <div className="metric-label">Medium Risk</div>
                  <div className="metric-value">{summary.mediumRiskCount}</div>
                </div>
                <span className="metric-icon"><i className="bi bi-activity"></i></span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card metric-card metric-low h-100">
              <div className="card-body d-flex justify-content-between align-items-start p-3 p-md-4">
                <div>
                  <div className="metric-label">Low Risk</div>
                  <div className="metric-value">{summary.lowRiskCount}</div>
                </div>
                <span className="metric-icon"><i className="bi bi-check-circle"></i></span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Table Card */}
        <div className="card panel-table shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center py-3">
            <span className="fw-bold">
              <i className="bi bi-list-ul me-2 text-primary"></i>
              {showingAllVehicles ? 'Fleet Operational Roster' : 'Registered Vehicles'}
            </span>
            <div className="d-flex gap-2">
              <Link to="/vehicles" className="btn btn-sm btn-outline-dark">
                <i className="bi bi-grid me-1"></i>Garage View
              </Link>
            </div>
          </div>

          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Vehicle Name</th>
                  <th>Make / Model</th>
                  <th>Year</th>
                  <th>Mileage</th>
                  <th>VIN</th>
                  <th>Health Status</th>
                  <th className="text-end">Command Station</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <tr key={v.id}>
                      <td className="fw-bold text-dark">
                        <Link to={`/vehicles/${v.id}`} className="text-decoration-none text-dark">
                          {v.name}
                        </Link>
                      </td>
                      <td>{v.make} {v.model}</td>
                      <td>{v.year}</td>
                      <td>{v.mileage ? v.mileage.toLocaleString() + ' km' : 'N/A'}</td>
                      <td><code>{v.vin || 'N/A'}</code></td>
                      <td>
                        {v.latest_risk_level === 'HIGH' ? (
                          <span className="badge bg-danger">HIGH RISK</span>
                        ) : v.latest_risk_level === 'MEDIUM' ? (
                          <span className="badge bg-warning text-dark">MEDIUM RISK</span>
                        ) : v.latest_risk_level === 'LOW' ? (
                          <span className="badge bg-success">LOW RISK</span>
                        ) : (
                          <span className="badge bg-secondary">MONITORING</span>
                        )}
                      </td>
                      <td className="text-end">
                        <Link to={`/vehicles/${v.id}`} className="btn btn-sm btn-dark">
                          <i className="bi bi-cpu me-1"></i>HUD Station
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="empty-state">
                        <i className="bi bi-truck"></i>
                        <h6 className="fw-bold">No vehicles registered yet</h6>
                        <p className="text-muted small">Register your first vehicle to start tracking telemetry streams.</p>
                        <Link to="/vehicles/new" className="btn btn-dark btn-sm">
                          <i className="bi bi-plus-circle me-1"></i>Add Vehicle
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
