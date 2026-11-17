import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('sensors'); // 'sensors' | 'alerts' | 'maintenance' | 'settings'

  // Maintenance form state
  const [maintAction, setMaintAction] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  // AI Diagnostic modal result state
  const [aiResult, setAiResult] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const fetchVehicleData = async () => {
    try {
      const [detailRes, chartRes] = await Promise.all([
        api.get(`/vehicles/${id}`),
        api.get(`/charts/vehicle/${id}/sensors`)
      ]);

      setVehicle(detailRes.data?.vehicle);
      setSensorReadings(detailRes.data?.sensorReadings || []);
      setMaintenanceRecords(detailRes.data?.maintenanceRecords || []);
      setAlerts(detailRes.data?.alerts || []);
      setChartData(chartRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load vehicle telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  // Simulate 1 reading
  const handleSimulateOne = async () => {
    setActionLoading(true);
    try {
      await api.post(`/vehicles/${id}/simulate`);
      setSuccess('Simulated 1 live sensor reading.');
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to simulate reading.');
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate 20 historical readings
  const handleSimulateHistory = async () => {
    setActionLoading(true);
    try {
      await api.post(`/vehicles/${id}/simulate/history`);
      setSuccess('Simulated 20 historical readings.');
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate history.');
    } finally {
      setActionLoading(false);
    }
  };

  // Inject intentional anomaly scenario
  const handleInjectAnomaly = async (type) => {
    setActionLoading(true);
    try {
      await api.post(`/vehicles/${id}/inject-anomaly`, { anomalyType: type });
      setSuccess(`Injected telemetry anomaly: ${type}. Check charts or run AI Diagnostic.`);
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to inject anomaly.');
    } finally {
      setActionLoading(false);
    }
  };

  // Run Quick AI Analysis
  const handleQuickAnalysis = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/predictions/${id}/quick`);
      setAiResult(res.data?.result);
      setAiModalOpen(true);
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Quick AI Analysis failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Run Deep AI Diagnostic
  const handleDeepDiagnostic = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/predictions/${id}/deep`);
      setAiResult(res.data?.result);
      setAiModalOpen(true);
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Deep AI Diagnostic failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Log Maintenance
  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    if (!maintAction.trim()) return;

    try {
      await api.post('/maintenance/save', {
        vehicleId: id,
        action: maintAction,
        notes: maintNotes
      });
      setSuccess('Maintenance record logged successfully.');
      setMaintAction('');
      setMaintNotes('');
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log maintenance.');
    }
  };

  // Mark Repair Done
  const handleMarkDone = async (recordId) => {
    try {
      await api.post(`/maintenance/${recordId}/done`, { vehicleId: id });
      setSuccess('Repair marked as completed.');
      await fetchVehicleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update repair state.');
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Initializing Vehicle Telemetry HUD..." />
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="container py-5 text-center">
          <h4>Vehicle Not Found</h4>
          <Link to="/vehicles" className="btn btn-dark mt-3">Back to Garage</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Chart configs
  const labels = chartData?.labels || [];

  const tempChartData = {
    labels,
    datasets: [
      {
        label: 'Engine Temp (°C)',
        data: chartData?.engineTemp || [],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const rpmChartData = {
    labels,
    datasets: [
      {
        label: 'Engine RPM',
        data: chartData?.rpm || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const oilChartData = {
    labels,
    datasets: [
      {
        label: 'Oil Pressure (PSI)',
        data: chartData?.oilPressure || [],
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const vibChartData = {
    labels,
    datasets: [
      {
        label: 'Vibration Index (G)',
        data: chartData?.vibration || [],
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        <FlashAlert success={success} error={error} onClose={() => { setSuccess(''); setError(''); }} />

        {/* Futuristic Vehicle Command HUD Banner */}
        <div className="hud-header-banner">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div className="eyebrow mb-1">
                <i className="bi bi-cpu me-1"></i>Vehicle Telemetry HUD Command Station
              </div>
              <h1 className="hud-title mb-1">{vehicle.name}</h1>
              <p className="text-light opacity-75 mb-0 small">
                {vehicle.make} {vehicle.model} • VIN: <code className="text-info">{vehicle.vin || 'VIN-UNASSIGNED'}</code>
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-hero-outline"
                onClick={handleQuickAnalysis}
                disabled={actionLoading}
              >
                <i className="bi bi-lightning-fill me-1.5 text-warning"></i>Quick AI Analysis
              </button>
              <button
                type="button"
                className="btn btn-light fw-bold"
                onClick={handleDeepDiagnostic}
                disabled={actionLoading}
              >
                <i className="bi bi-search me-1.5 text-primary"></i>Deep Diagnostic
              </button>
              <Link to="/vehicles" className="btn btn-outline-nav">
                <i className="bi bi-arrow-left me-1"></i>Garage
              </Link>
            </div>
          </div>

          {/* Quick Spec Tiles */}
          <div className="hud-stat-grid">
            <div className="hud-stat-card">
              <div className="hud-stat-label"><i className="bi bi-speedometer2 me-1 text-info"></i>Mileage</div>
              <div className="hud-stat-value">{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : '0 km'}</div>
            </div>
            <div className="hud-stat-card">
              <div className="hud-stat-label"><i className="bi bi-calendar-check me-1 text-info"></i>Model Year</div>
              <div className="hud-stat-value">{vehicle.year || 'N/A'}</div>
            </div>
            <div className="hud-stat-card">
              <div className="hud-stat-label"><i className="bi bi-fuel-pump me-1 text-info"></i>Engine</div>
              <div className="hud-stat-value fs-6">{vehicle.engine_type || vehicle.engineType || 'Standard Specs'}</div>
            </div>
            <div className="hud-stat-card">
              <div className="hud-stat-label"><i className="bi bi-activity me-1 text-info"></i>Telemetry Stream</div>
              <div className="hud-stat-value fs-6 text-success"><i className="bi bi-circle-fill me-1 fs-6"></i>Active Stream</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'sensors' ? 'active' : ''}`}
              onClick={() => setActiveTab('sensors')}
            >
              <i className="bi bi-activity me-1.5"></i>Live Telemetry &amp; Charts
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <i className="bi bi-cpu me-1.5"></i>AI Fault Predictions ({alerts.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <i className="bi bi-tools me-1.5"></i>Maintenance Timeline ({maintenanceRecords.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="bi bi-sliders me-1.5"></i>Vehicle Settings
            </button>
          </li>
        </ul>

        {/* Tab 1: Live Telemetry & Charts */}
        {activeTab === 'sensors' && (
          <div>
            {/* Simulator Controls & Anomaly Injection Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 p-3 rounded-3 shadow-sm border" style={{ background: 'var(--surface-card)' }}>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={handleSimulateOne}
                  disabled={actionLoading}
                >
                  <i className="bi bi-play-fill me-1"></i>Simulate 1 Reading
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={handleSimulateHistory}
                  disabled={actionLoading}
                >
                  <i className="bi bi-clock-history me-1"></i>Seed 20 Historical Readings
                </button>
                <Link to="/sensors/upload" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-upload me-1"></i>Manual Sensor Upload
                </Link>
              </div>

              {/* Anomaly Injector Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-danger dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  disabled={actionLoading}
                >
                  <i className="bi bi-lightning-charge me-1"></i>Inject Anomaly Scenario
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <button className="dropdown-item" onClick={() => handleInjectAnomaly('OVERHEATING')}>
                      🔥 Severe Overheating (&gt;105°C, P0217)
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleInjectAnomaly('LOW_OIL')}>
                      🛢️ Critical Low Oil Pressure (&lt;15 PSI, P0520)
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleInjectAnomaly('HIGH_VIBRATION')}>
                      📳 Severe Engine Mount Vibration (&gt;1.8 G)
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleInjectAnomaly('MISFIRE_DTC')}>
                      ⚡ Engine Misfire Trouble Code (P0300)
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <span className="small fw-bold"><i className="bi bi-thermometer-half me-1 text-danger"></i>Engine Temperature</span>
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" style={{ fontSize: '0.7rem' }}>
                      Threshold: &gt; 100°C
                    </span>
                  </div>
                  <div className="card-body" style={{ height: '240px' }}>
                    <Line data={tempChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <span className="small fw-bold"><i className="bi bi-droplet-half me-1 text-warning"></i>Oil Pressure</span>
                    <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25" style={{ fontSize: '0.7rem' }}>
                      Threshold: &lt; 20 PSI
                    </span>
                  </div>
                  <div className="card-body" style={{ height: '240px' }}>
                    <Line data={oilChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <span className="small fw-bold"><i className="bi bi-speedometer me-1 text-primary"></i>Engine RPM</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                      Threshold: &gt; 5000 RPM
                    </span>
                  </div>
                  <div className="card-body" style={{ height: '240px' }}>
                    <Line data={rpmChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <span className="small fw-bold"><i className="bi bi-activity me-1 text-teal"></i>Vibration Harmonic</span>
                    <span className="badge bg-secondary bg-opacity-10 text-dark border" style={{ fontSize: '0.7rem' }}>
                      Threshold: &gt; 1.0 G
                    </span>
                  </div>
                  <div className="card-body" style={{ height: '240px' }}>
                    <Line data={vibChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Readings Table */}
            <div className="card panel-table shadow-sm">
              <div className="card-header py-3 fw-bold">
                <i className="bi bi-table me-2 text-primary"></i>Latest Telemetry Readings ({sensorReadings.length})
              </div>
              <div className="card-body p-0 table-responsive" style={{ maxHeight: '400px' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Timestamp</th>
                      <th>Engine Temp</th>
                      <th>Oil Pressure</th>
                      <th>RPM</th>
                      <th>Vibration</th>
                      <th>DTC Error Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorReadings.length > 0 ? (
                      sensorReadings.map((r) => (
                        <tr key={r.id}>
                          <td className="small text-muted">
                            {r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td>
                            <span className={r.engine_temp > 100 ? 'text-danger fw-bold' : ''}>
                              {r.engine_temp ? Number(r.engine_temp).toFixed(1) + '°C' : '-'}
                            </span>
                          </td>
                          <td>
                            <span className={r.oil_pressure < 20 ? 'text-danger fw-bold' : ''}>
                              {r.oil_pressure ? Number(r.oil_pressure).toFixed(1) + ' PSI' : '-'}
                            </span>
                          </td>
                          <td>{r.rpm ? Math.round(r.rpm) : '-'}</td>
                          <td>
                            <span className={r.vibration > 1.0 ? 'text-danger fw-bold' : ''}>
                              {r.vibration ? Number(r.vibration).toFixed(2) + ' G' : '-'}
                            </span>
                          </td>
                          <td>
                            {r.error_code ? (
                              <span className="badge bg-danger">{r.error_code}</span>
                            ) : (
                              <span className="text-muted small">None</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No sensor readings found. Click "Simulate 1 Reading" above to generate telemetry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Fault Predictions */}
        {activeTab === 'alerts' && (
          <div className="card panel-table shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center py-3">
              <span className="fw-bold"><i className="bi bi-cpu me-2 text-primary"></i>AI Fault Predictions History</span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-dark" onClick={handleQuickAnalysis}>
                  <i className="bi bi-lightning-fill me-1 text-warning"></i>Run Quick Analysis
                </button>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={handleDeepDiagnostic}>
                  <i className="bi bi-search me-1 text-primary"></i>Run Deep Diagnostic
                </button>
              </div>
            </div>

            <div className="card-body p-0 table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Timestamp</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Predicted Fault Type</th>
                    <th>AI Explanation</th>
                    <th className="text-end">Full Report</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length > 0 ? (
                    alerts.map((a) => (
                      <tr key={a.id}>
                        <td className="small text-muted">
                          {a.created_at ? new Date(a.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="fw-bold">
                          {Number(a.risk_score).toFixed(1)} / 100
                        </td>
                        <td>
                          {a.risk_level === 'HIGH' ? (
                            <span className="badge bg-danger">HIGH RISK</span>
                          ) : a.risk_level === 'MEDIUM' ? (
                            <span className="badge bg-warning text-dark">MEDIUM RISK</span>
                          ) : (
                            <span className="badge bg-success">LOW RISK</span>
                          )}
                        </td>
                        <td className="fw-semibold">{a.predicted_fault_type}</td>
                        <td className="small text-muted" style={{ maxWidth: '320px' }}>
                          {a.explanations && a.explanations.length > 0 ? (
                            <div className="text-truncate">
                              {a.explanations[0].explanation_text}
                            </div>
                          ) : (
                            'Explanation logged in report.'
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              const exp = a.explanations?.[0];
                              setAiResult({
                                predictionId: a.id,
                                riskScore: a.risk_score,
                                riskLevel: a.risk_level,
                                predictedFaultType: a.predicted_fault_type,
                                explanation: exp?.explanation_text || 'No explanation recorded.',
                                modelName: exp?.model_name || 'Groq LLaMA 3.3',
                                mode: exp?.mode || 'QUICK',
                                createdAt: a.created_at
                              });
                              setAiModalOpen(true);
                            }}
                          >
                            <i className="bi bi-file-text me-1"></i>View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="empty-state">
                          <i className="bi bi-cpu"></i>
                          <h6 className="fw-bold">No AI predictions run yet</h6>
                          <p className="text-muted small">Trigger Quick Analysis or Deep Diagnostic to evaluate fault risks.</p>
                          <button type="button" className="btn btn-dark btn-sm" onClick={handleQuickAnalysis}>
                            Run First Diagnostic
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Maintenance Timeline */}
        {activeTab === 'maintenance' && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card shadow-sm p-4 border">
                <h5 className="fw-bold mb-3"><i className="bi bi-plus-circle me-2 text-primary"></i>Log Maintenance Event</h5>
                <form onSubmit={handleSaveMaintenance}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="maintAction">Action Taken *</label>
                    <input
                      type="text"
                      id="maintAction"
                      className="form-control"
                      placeholder="e.g. Replaced thermostat valve & flushed coolant"
                      value={maintAction}
                      onChange={(e) => setMaintAction(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="maintNotes">Service Notes / Work Order</label>
                    <textarea
                      id="maintNotes"
                      className="form-control"
                      rows="4"
                      placeholder="Parts installed, technician observations, warranty notes..."
                      value={maintNotes}
                      onChange={(e) => setMaintNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-dark w-100">
                    <i className="bi bi-check-lg me-1"></i>Record Maintenance Entry
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card panel-table shadow-sm">
                <div className="card-header py-3 fw-bold">
                  <i className="bi bi-clock-history me-2 text-primary"></i>Service History &amp; Records ({maintenanceRecords.length})
                </div>
                <div className="card-body p-0 table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th className="text-end">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceRecords.length > 0 ? (
                        maintenanceRecords.map((m) => (
                          <tr key={m.id}>
                            <td className="small text-muted">{m.date}</td>
                            <td>
                              <div className="fw-bold">{m.action}</div>
                              {m.notes && <div className="small text-muted">{m.notes}</div>}
                            </td>
                            <td>
                              {m.repair_done ? (
                                <span className="badge bg-success"><i className="bi bi-check-lg me-1"></i>Completed</span>
                              ) : (
                                <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i>Pending</span>
                              )}
                            </td>
                            <td className="text-end">
                              {!m.repair_done && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleMarkDone(m.id)}
                                >
                                  Mark Completed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted small">
                            No service records logged yet for this asset.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Vehicle Settings */}
        {activeTab === 'settings' && (
          <div className="card shadow-sm p-4 border" style={{ maxWidth: '640px' }}>
            <h5 className="fw-bold mb-3"><i className="bi bi-sliders me-2 text-primary"></i>Asset Configuration</h5>
            <p className="text-muted small">Update specifications or delete asset from fleet tracking.</p>

            <div className="d-flex gap-3">
              <Link to={`/vehicles/${id}/edit`} className="btn btn-outline-dark">
                <i className="bi bi-pencil me-1"></i>Edit Specifications
              </Link>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={async () => {
                  if (window.confirm(`Delete ${vehicle.name}? This will remove all associated telemetry.`)) {
                    await api.delete(`/vehicles/${id}`);
                    navigate('/vehicles');
                  }
                }}
              >
                <i className="bi bi-trash me-1"></i>Delete Vehicle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Diagnostic Report Modal */}
      {aiModalOpen && aiResult && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header bg-dark text-white p-3 p-md-4">
                <div>
                  <span className="badge bg-info text-dark mb-1">
                    {aiResult.mode === 'DEEP' ? '🔍 Deep Diagnostic Report (RAG Grounded)' : '⚡ Quick Health Assessment'}
                  </span>
                  <h4 className="modal-title fw-bold">{vehicle.name} Diagnostic Brief</h4>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAiModalOpen(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center p-3 mb-4 rounded-3 border bg-light">
                  <div>
                    <div className="small text-muted">Risk Assessment:</div>
                    <div className="fs-4 fw-bold">
                      {Number(aiResult.riskScore).toFixed(1)} <span className="fs-6 text-muted">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`badge fs-6 ${
                        aiResult.riskLevel === 'HIGH'
                          ? 'bg-danger'
                          : aiResult.riskLevel === 'MEDIUM'
                          ? 'bg-warning text-dark'
                          : 'bg-success'
                      }`}
                    >
                      {aiResult.riskLevel} SEVERITY
                    </span>
                  </div>
                  <div>
                    <div className="small text-muted">Predicted Issue:</div>
                    <div className="fw-bold">{aiResult.predictedFaultType}</div>
                  </div>
                </div>

                <div className="p-3 border rounded-3 mb-3" style={{ background: 'var(--surface-subtle, rgba(255,255,255,0.03))' }}>
                  <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-robot me-1.5"></i>AI Technical Findings:</h6>
                  <div
                    className="report-content"
                    style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '0.92rem' }}
                  >
                    {aiResult.explanation}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center small text-muted">
                  <span>Model: <code>{aiResult.modelName || 'Groq LLaMA 3.3'}</code></span>
                  {aiResult.latencyMs && <span>Inference Time: {aiResult.latencyMs} ms</span>}
                </div>
              </div>

              <div className="modal-footer p-3">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setAiModalOpen(false)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i>Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
