import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // Interactive Live Diagnostic Simulator on the landing page
  const [engineTemp, setEngineTemp] = useState(92);
  const [oilPressure, setOilPressure] = useState(45);
  const [rpm, setRpm] = useState(2400);
  const [vibration, setVibration] = useState(0.28);
  const [errorCode, setErrorCode] = useState('');

  // Real-time interactive calculation using the exact algorithm
  const liveAnalysis = useMemo(() => {
    let score = 0;
    if (engineTemp > 110) score += 3.0;
    else if (engineTemp > 100) score += 2.0;
    else if (engineTemp > 95) score += 1.0;

    if (oilPressure < 10) score += 3.0;
    else if (oilPressure < 20) score += 2.0;
    else if (oilPressure > 80) score += 1.5;

    if (rpm > 6000) score += 2.0;
    else if (rpm > 5000) score += 1.0;

    if (vibration > 2.0) score += 3.0;
    else if (vibration > 1.0) score += 1.5;
    else if (vibration > 0.5) score += 0.5;

    if (errorCode && errorCode.trim()) score += 2.0;

    const normalized = Math.min(score * 10, 100);
    const riskScore = Math.round(normalized * 10) / 10;

    let riskLevel = 'LOW';
    if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    let fault = 'Normal Operation — Vehicle in Optimal Condition';
    if (engineTemp > 100) fault = 'Cooling System Fault / Overheating Risk';
    else if (oilPressure < 20) fault = 'Low Oil Pressure / Bearing Risk';
    else if (vibration > 1.0) fault = 'Engine Mount Wear / Excessive Harmonic Vibration';
    else if (errorCode) fault = `ECU Fault Code Logged: ${errorCode}`;

    return { riskScore, riskLevel, fault };
  }, [engineTemp, oilPressure, rpm, vibration, errorCode]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Hero Section */}
        <section className="landing-hero mb-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="landing-hero-badge">
                <i className="bi bi-broadcast"></i> IoT Telemetry + Generative RAG Diagnostics
              </div>
              <h1 className="landing-hero-title">
                Eliminate Breakdowns Before They Happen.
              </h1>
              <p className="landing-hero-lead">
                AutoGuard AI converts raw high-frequency vehicle telemetry—RPM, thermal gradients, oil pressure, and vibration harmonics—into predictive AI diagnostics grounded in OEM technical manuals.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-lg btn-light fw-bold px-4">
                    <i className="bi bi-speedometer2 me-2 text-primary"></i>Enter Command Center
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-lg btn-light fw-bold px-4">
                      <i className="bi bi-rocket-takeoff me-2 text-primary"></i>Get Started Free
                    </Link>
                    <Link to="/login" className="btn btn-lg btn-hero-outline px-4">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Sign In to Fleet
                    </Link>
                  </>
                )}
                <a href="#demo" className="btn btn-lg btn-outline-nav px-4">
                  <i className="bi bi-sliders me-2"></i>Try Live Simulator
                </a>
              </div>

              <div className="d-flex align-items-center gap-4 text-light small flex-wrap">
                <div><i className="bi bi-check2-circle text-info me-1"></i> Groq LLaMA 3.3 Inference</div>
                <div><i className="bi bi-check2-circle text-info me-1"></i> RAG Manual Grounding</div>
                <div><i className="bi bi-check2-circle text-info me-1"></i> Multi-Role RBAC</div>
              </div>
            </div>

            {/* Live Interactive Telemetry Preview Card */}
            <div className="col-lg-5">
              <div className="auth-card-modern p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="eyebrow m-0"><i className="bi bi-cpu me-1"></i>Live Telemetry Stream</span>
                  <span className="badge bg-success"><i className="bi bi-circle-fill me-1 fs-6"></i>Streaming Active</span>
                </div>

                <div className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 mb-3">
                  <div className="small text-muted mb-1">Asset Monitored:</div>
                  <div className="fw-bold text-white fs-5">Tesla Model 3 Performance</div>
                  <div className="small text-info">VIN: 5YJ3E1EB8NF102948 • Dual Motor AWD</div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                      <div className="small text-muted">Engine Temp</div>
                      <div className="fs-5 fw-bold text-white">88.4°C <span className="text-success small fs-6">OK</span></div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                      <div className="small text-muted">Oil Pressure</div>
                      <div className="fs-5 fw-bold text-white">48.2 PSI <span className="text-success small fs-6">OK</span></div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                      <div className="small text-muted">Engine RPM</div>
                      <div className="fs-5 fw-bold text-white">2,150 <span className="text-info small fs-6">IDLE</span></div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                      <div className="small text-muted">Vibration</div>
                      <div className="fs-5 fw-bold text-white">0.24 G <span className="text-success small fs-6">LOW</span></div>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                  <span className="small text-success fw-bold"><i className="bi bi-shield-check me-1"></i>Risk Score: 12.0 / 100</span>
                  <span className="badge bg-success">LOW RISK</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Diagnostic Calculator Demo */}
        <section id="demo" className="mb-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h4 className="fw-bold mb-1">
                    <i className="bi bi-sliders2-vertical me-2 text-info"></i>Interactive Anomaly Risk Engine
                  </h4>
                  <p className="text-muted small mb-0">
                    Adjust the live sensors below to test AutoGuard AI's real-time risk scoring and fault prediction algorithm.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={() => {
                    setEngineTemp(108);
                    setOilPressure(14);
                    setVibration(1.9);
                    setRpm(5600);
                    setErrorCode('P0217');
                  }}
                >
                  <i className="bi bi-lightning-fill me-1"></i>Simulate Critical Failure
                </button>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-4">
                {/* Sliders */}
                <div className="col-lg-7">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label fw-bold small">
                        <i className="bi bi-thermometer-half text-danger me-1"></i>Engine Temperature: {engineTemp}°C
                      </label>
                      <span className={`small fw-bold ${engineTemp > 100 ? 'text-danger' : 'text-success'}`}>
                        {engineTemp > 100 ? 'Danger (>100°C)' : 'Normal (80-95°C)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="60"
                      max="130"
                      value={engineTemp}
                      onChange={(e) => setEngineTemp(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label fw-bold small">
                        <i className="bi bi-droplet-half text-warning me-1"></i>Oil Pressure: {oilPressure} PSI
                      </label>
                      <span className={`small fw-bold ${oilPressure < 20 ? 'text-danger' : 'text-success'}`}>
                        {oilPressure < 20 ? 'Critical Low (<20 PSI)' : 'Normal (25-65 PSI)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="5"
                      max="90"
                      value={oilPressure}
                      onChange={(e) => setOilPressure(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label fw-bold small">
                        <i className="bi bi-speedometer text-primary me-1"></i>Engine RPM: {rpm}
                      </label>
                      <span className={`small fw-bold ${rpm > 5000 ? 'text-warning' : 'text-success'}`}>
                        {rpm > 5000 ? 'High RPM Load' : 'Normal Operating Band'}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="700"
                      max="7500"
                      step="50"
                      value={rpm}
                      onChange={(e) => setRpm(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="form-label fw-bold small">
                        <i className="bi bi-activity text-info me-1"></i>Vibration Index: {vibration.toFixed(2)} G
                      </label>
                      <span className={`small fw-bold ${vibration > 1.0 ? 'text-danger' : 'text-success'}`}>
                        {vibration > 1.0 ? 'Excessive Harmonic (>1.0 G)' : 'Smooth (<0.5 G)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0.05"
                      max="3.0"
                      step="0.05"
                      value={vibration}
                      onChange={(e) => setVibration(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Simulate OBD-II Diagnostic Trouble Code</label>
                    <select
                      className="form-select form-select-sm"
                      value={errorCode}
                      onChange={(e) => setErrorCode(e.target.value)}
                    >
                      <option value="">No Error Code (Clear)</option>
                      <option value="P0217">P0217 — Engine Coolant Over Temperature Condition</option>
                      <option value="P0520">P0520 — Engine Oil Pressure Sensor/Switch Circuit Malfunction</option>
                      <option value="P0300">P0300 — Random/Multiple Cylinder Misfire Detected</option>
                      <option value="P0128">P0128 — Coolant Temperature Below Thermostat Regulating Temp</option>
                      <option value="P0171">P0171 — System Too Lean (Bank 1)</option>
                    </select>
                  </div>
                </div>

                {/* Live Real-time Result Deck */}
                <div className="col-lg-5">
                  <div
                    className={`card h-100 p-4 border-2 ${
                      liveAnalysis.riskLevel === 'HIGH'
                        ? 'border-danger bg-danger bg-opacity-10'
                        : liveAnalysis.riskLevel === 'MEDIUM'
                        ? 'border-warning bg-warning bg-opacity-10'
                        : 'border-success bg-success bg-opacity-10'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="small fw-bold text-uppercase text-muted">Predicted Risk Assessment</span>
                      <span
                        className={`badge ${
                          liveAnalysis.riskLevel === 'HIGH'
                            ? 'bg-danger'
                            : liveAnalysis.riskLevel === 'MEDIUM'
                            ? 'bg-warning text-dark'
                            : 'bg-success'
                        }`}
                      >
                        {liveAnalysis.riskLevel} RISK
                      </span>
                    </div>

                    <div className="text-center my-3">
                      <div className="display-4 fw-bold">
                        {liveAnalysis.riskScore}
                        <span className="fs-5 text-muted"> / 100</span>
                      </div>
                      <div className="progress mt-2" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar ${
                            liveAnalysis.riskLevel === 'HIGH'
                              ? 'bg-danger'
                              : liveAnalysis.riskLevel === 'MEDIUM'
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          role="progressbar"
                          style={{ width: `${liveAnalysis.riskScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-3 shadow-sm border mb-3">
                      <div className="small text-muted fw-bold mb-1">Predicted Fault Signature:</div>
                      <div className="fw-bold text-dark">{liveAnalysis.fault}</div>
                    </div>

                    <div className="mt-auto">
                      <Link to="/register" className="btn btn-dark w-100 py-2 fw-bold">
                        <i className="bi bi-shield-check me-1"></i>Register Fleet to Monitor Live
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="mb-5">
          <div className="text-center mb-4">
            <span className="section-kicker"><i className="bi bi-grid-fill me-1"></i>Full Platform Capabilities</span>
            <h2 className="fw-bold">Enterprise Predictive Fleet Operations</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-pill">
                <div className="feature-pill-icon"><i className="bi bi-cpu-fill"></i></div>
                <h5 className="fw-bold text-dark">Continuous Telemetry Streaming</h5>
                <p className="text-muted small mb-0">
                  Ingests vehicle sensor parameters every 30 seconds. Detects micro-variances in temperature, RPM, oil pressure, and vibration before catastrophic mechanical failure.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-pill">
                <div className="feature-pill-icon"><i className="bi bi-lightning-charge-fill"></i></div>
                <h5 className="fw-bold text-dark">Dual-Mode Generative AI</h5>
                <p className="text-muted small mb-0">
                  Execute <strong>Quick Analysis</strong> for instant health summaries, or trigger <strong>Deep Diagnostic</strong> for exhaustive OEM repair checklists with root-cause identification.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-pill">
                <div className="feature-pill-icon"><i className="bi bi-journal-bookmark-fill"></i></div>
                <h5 className="fw-bold text-dark">RAG Grounded in Manuals</h5>
                <p className="text-muted small mb-0">
                  Retrieval-Augmented Generation embeds verified technical bulletins and service manuals, ensuring AI recommendations are free of hallucinations.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-pill">
                <div className="feature-pill-icon"><i className="bi bi-graph-up"></i></div>
                <h5 className="fw-bold text-dark">Live Interactive Chart HUD</h5>
                <p className="text-muted small mb-0">
                  Dynamic Chart.js visualizations track historical sensor timelines with danger threshold indicators for immediate visual diagnosis.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-pill">
                <div className="feature-pill-icon"><i className="bi bi-tools"></i></div>
                <h5 className="fw-bold text-dark">Integrated Maintenance Log</h5>
                <p className="text-muted small mb-0">
                  Log repairs, track scheduled servicing, and correlate maintenance history directly with incoming sensor faults and risk levels.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-pill">
                <div className="feature-pill-icon"><i className="bi bi-shield-lock-fill"></i></div>
                <h5 className="fw-bold text-dark">Granular Role-Based Security</h5>
                <p className="text-muted small mb-0">
                  Enforces strict data isolation between vehicle Owners, Fleet Engineers, and Administrators, backed by stateless JWT authentication.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
