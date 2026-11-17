import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Radar from '../components/common/Radar';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  // Interactive Live Diagnostic Simulator
  const [engineTemp, setEngineTemp] = useState(90);
  const [oilPressure, setOilPressure] = useState(48);
  const [rpm, setRpm] = useState(2400);
  const [vibration, setVibration] = useState(0.24);
  const [errorCode, setErrorCode] = useState('');

  // Interactive calculation using the exact business algorithm
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

    let fault = 'Optimal Baseline — All powertrain telemetry within nominal thresholds.';
    if (engineTemp > 100 && oilPressure < 20) fault = 'Severe Thermal Breakdown: Bearing Wear & Head Gasket Vulnerability';
    else if (engineTemp > 100) fault = 'Thermal Excursion: Cooling system failure or radiator lock';
    else if (oilPressure < 20) fault = 'Critical Lubrication Loss: Oil pump cavitating or seal failure';
    else if (vibration > 1.0) fault = 'Harmonic Instability: Engine mount fatigue or drive-axle imbalance';
    else if (errorCode) fault = `DTC Alert: Code ${errorCode} requires scheduled inspection`;

    return { riskScore, riskLevel, fault };
  }, [engineTemp, oilPressure, rpm, vibration, errorCode]);

  const applyPreset = (preset) => {
    switch (preset) {
      case 'critical':
        setEngineTemp(112);
        setOilPressure(14);
        setVibration(2.2);
        setRpm(5900);
        setErrorCode('P0217');
        break;
      case 'oil':
        setEngineTemp(94);
        setOilPressure(15);
        setVibration(0.65);
        setRpm(2200);
        setErrorCode('P0520');
        break;
      case 'vibration':
        setEngineTemp(90);
        setOilPressure(48);
        setVibration(1.85);
        setRpm(3100);
        setErrorCode('P0300');
        break;
      case 'nominal':
      default:
        setEngineTemp(88);
        setOilPressure(48);
        setVibration(0.22);
        setRpm(2100);
        setErrorCode('');
        break;
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      {/* =========================================================
          FULL-WIDTH EDGE-TO-EDGE HERO SECTION WITH <Radar />
          ========================================================= */}
      <section className="hero-fullwidth-section">
        {/* WebGL Radar Canvas Background - Fills edge-to-edge */}
        <div className="hero-radar-full-layer">
          <Radar
            color={isDark ? '#38bdf8' : '#0284c7'}
            backgroundColor="transparent"
            mode="sweep"
            speed={0.75}
            trail={0.35}
            scale={0.94}
            ringCount={6}
            spokeCount={12}
            targets={7}
            clutter={0.25}
            mouseInteraction={true}
            lightMode={!isDark}
          />
        </div>

        {/* Ambient Gradient Glow & Subtle Grid Matrix */}
        <div className="hero-full-ambient-glow" />
        <div className="hero-full-grid-pattern" />

        {/* Hero Content Container */}
        <div className="container hero-full-content-container">
          <div className="hero-text-deck text-center">
            {/* Pill Badge */}
            <div className="hero-pill-badge mb-3">
              <span className="hero-pulse-dot"></span>
              <span>Predictive Fleet Telemetry &amp; RAG AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-main-title">
              Autonomous Vehicle Observability <br className="d-none d-md-inline" />
              <span className="hero-gradient-text">Grounded in Predictive AI</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-lead-text">
              AutoGuard AI streams high-frequency IoT sensors into real-time Groq LLaMA 3.3 diagnostics, cross-referencing anomalies directly with OEM service manuals.
            </p>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-hero-cta">
                  <i className="bi bi-speedometer2 me-2"></i>Enter Command Center
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-hero-cta">
                    <i className="bi bi-rocket-takeoff me-2"></i>Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-hero-secondary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Demo Access
                  </Link>
                </>
              )}
              <a href="#simulator" className="btn btn-hero-secondary">
                <i className="bi bi-sliders me-2"></i>Test Live Simulator
              </a>
            </div>

            {/* Live Telemetry Mock Console */}
            <div className="hero-telemetry-console shadow-lg">
              <div className="console-top-strip">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 py-1 px-2.5">
                    <i className="bi bi-broadcast me-1"></i> TELEMETRY ACTIVE
                  </span>
                  <span className="small text-muted font-monospace d-none d-sm-inline">
                    NODE: US-FLEET-01
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 small">
                  <span className="font-monospace text-info">VIN: 5YJ3E1EB8NF102948</span>
                  <span className="badge bg-primary bg-opacity-25 text-info">Tesla Model 3 Performance</span>
                </div>
              </div>

              <div className="console-metrics-row">
                <div className="console-metric-cell">
                  <div className="cell-label">Engine Temp</div>
                  <div className="cell-value">88.4°C <span className="cell-badge ok">OK</span></div>
                  <div className="cell-sub">Nominal: 80 - 95°C</div>
                </div>

                <div className="console-metric-cell">
                  <div className="cell-label">Oil Pressure</div>
                  <div className="cell-value">48.2 PSI <span className="cell-badge ok">OK</span></div>
                  <div className="cell-sub">Nominal: 25 - 65 PSI</div>
                </div>

                <div className="console-metric-cell">
                  <div className="cell-label">Vibration Index</div>
                  <div className="cell-value">0.22 G <span className="cell-badge ok">SMOOTH</span></div>
                  <div className="cell-sub">Threshold: &lt; 0.5 G</div>
                </div>

                <div className="console-metric-cell">
                  <div className="cell-label">Risk Assessment</div>
                  <div className="cell-value text-success">12.0 <span className="cell-sub">/ 100</span></div>
                  <div className="cell-sub text-success"><i className="bi bi-shield-check me-1"></i>Optimal</div>
                </div>
              </div>

              <div className="console-status-strip">
                <div className="d-flex align-items-center gap-2 small text-truncate">
                  <i className="bi bi-cpu text-info"></i>
                  <span className="text-muted">AI Diagnostic:</span>
                  <span className="fw-semibold text-truncate">Zero anomalous variance detected across powertrain telemetry.</span>
                </div>
                <span className="badge bg-info bg-opacity-25 text-info flex-shrink-0">99.4% Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ANIMATED STAT COUNTER RIBBON
          ========================================================= */}
      <section className="container my-5">
        <div className="stat-counter-ribbon-modern">
          <div className="stat-ribbon-item">
            <div className="stat-ribbon-number">
              <AnimatedCounter end={14800} suffix="+" />
            </div>
            <div className="stat-ribbon-label">Vehicles Monitored</div>
          </div>

          <div className="stat-ribbon-item">
            <div className="stat-ribbon-number">
              <AnimatedCounter end={99.98} decimals={2} suffix="%" />
            </div>
            <div className="stat-ribbon-label">Anomaly Detection</div>
          </div>

          <div className="stat-ribbon-item">
            <div className="stat-ribbon-number">
              <AnimatedCounter end={4.2} decimals={1} suffix="M" />
            </div>
            <div className="stat-ribbon-label">Packets Ingested/Day</div>
          </div>

          <div className="stat-ribbon-item">
            <div className="stat-ribbon-number">
              <AnimatedCounter end={180} suffix="ms" />
            </div>
            <div className="stat-ribbon-label">LLaMA 3.3 Inference</div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENTO GRID CAPABILITIES (ACETERNITY STYLE)
          ========================================================= */}
      <section className="container mb-5">
        <div className="text-center mb-4">
          <span className="hero-pill-badge mb-2">
            <i className="bi bi-grid-fill me-1"></i> Core Architecture
          </span>
          <h2 className="fw-bold mb-2">Engineered for Preventative Fleet Precision</h2>
          <p className="text-muted small mx-auto" style={{ maxWidth: '580px' }}>
            Transform unpredictable breakdown downtime into scheduled, cost-efficient maintenance.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: RAG Engine */}
          <div className="bento-card bento-card-8">
            <div>
              <div className="bento-icon-box">
                <i className="bi bi-journal-code"></i>
              </div>
              <h3 className="bento-title">Retrieval-Augmented Technical Grounding</h3>
              <p className="bento-desc">
                Unlike generic LLMs that guess maintenance steps, AutoGuard AI retrieves verified manufacturer workshop manuals, DTC fault trees, and OEM technical service bulletins to provide hallucination-free repair advice.
              </p>
            </div>
            <div className="bento-sub-box">
              <span className="text-info fw-bold">[RAG Pipeline]</span> 120+ Indexed OEM Manuals &bull; Cosine Similarity Search &bull; Groq LLaMA 3.3 70B
            </div>
          </div>

          {/* Card 2: IoT Stream */}
          <div className="bento-card bento-card-4">
            <div>
              <div className="bento-icon-box">
                <i className="bi bi-broadcast"></i>
              </div>
              <h3 className="bento-title">Sub-Second IoT Stream</h3>
              <p className="bento-desc">
                Continuous ingestion of RPM, oil pressure, thermal gradients, and harmonic vibration to detect micro-wear before warning lights trip.
              </p>
            </div>
            <div className="d-flex gap-1.5 flex-wrap mt-2">
              <span className="badge bg-primary bg-opacity-25 text-info">RPM Frequency</span>
              <span className="badge bg-primary bg-opacity-25 text-info">Thermal Gradient</span>
              <span className="badge bg-primary bg-opacity-25 text-info">Oil PSI</span>
            </div>
          </div>

          {/* Card 3: Dual-Mode AI */}
          <div className="bento-card bento-card-4">
            <div>
              <div className="bento-icon-box">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <h3 className="bento-title">Dual-Mode AI Engine</h3>
              <p className="bento-desc">
                Execute <strong>Rapid Health Scoring</strong> for roadside driver triage or <strong>Deep Multi-Step RAG</strong> for certified workshop technicians.
              </p>
            </div>
          </div>

          {/* Card 4: RBAC */}
          <div className="bento-card bento-card-4">
            <div>
              <div className="bento-icon-box">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <h3 className="bento-title">Enterprise RBAC Scopes</h3>
              <p className="bento-desc">
                Strict data separation between Vehicle Owners, Fleet Engineers, and System Administrators enforced via stateless JWT verification.
              </p>
            </div>
          </div>

          {/* Card 5: Fleet Garage */}
          <div className="bento-card bento-card-4">
            <div>
              <div className="bento-icon-box">
                <i className="bi bi-car-front-fill"></i>
              </div>
              <h3 className="bento-title">Fleet Garage Operations</h3>
              <p className="bento-desc">
                Live vehicle telemetry HUD stations, historical sensor timelines, and automated maintenance records correlated with risk scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTERACTIVE ANOMALY RISK SIMULATOR
          ========================================================= */}
      <section id="simulator" className="container mb-5">
        <div className="simulator-card-modern shadow-sm">
          <div className="simulator-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h4 className="fw-bold mb-1">
                <i className="bi bi-sliders2-vertical me-2 text-info"></i>Interactive Anomaly Risk Engine
              </h4>
              <p className="text-muted small mb-0">
                Adjust sensor sliders or select presets to test real-time risk scoring and fault prediction.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => applyPreset('nominal')}
              >
                <i className="bi bi-check-circle me-1"></i>Nominal
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning"
                onClick={() => applyPreset('oil')}
              >
                <i className="bi bi-droplet-half me-1"></i>Low Oil
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => applyPreset('critical')}
              >
                <i className="bi bi-lightning-fill me-1"></i>Critical
              </button>
            </div>
          </div>

          <div className="p-4">
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
                      {rpm > 5000 ? 'High Load' : 'Normal Operating Band'}
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
                      {vibration > 1.0 ? 'Harmonic Instability (>1.0 G)' : 'Smooth (<0.5 G)'}
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
                  <label className="form-label fw-bold small">Simulate OBD-II Diagnostic Code</label>
                  <select
                    className="form-select form-select-sm"
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                  >
                    <option value="">No Error Code (Clear)</option>
                    <option value="P0217">P0217 — Engine Coolant Over Temperature Condition</option>
                    <option value="P0520">P0520 — Engine Oil Pressure Sensor Malfunction</option>
                    <option value="P0300">P0300 — Random/Multiple Cylinder Misfire Detected</option>
                    <option value="P0128">P0128 — Coolant Temperature Below Regulating Temp</option>
                  </select>
                </div>
              </div>

              {/* Real-time Result Deck */}
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

                  <div className="p-3 rounded-3 shadow-sm border mb-3 simulator-fault-box">
                    <div className="small text-muted fw-bold mb-1">Predicted Fault Signature:</div>
                    <div className="fw-bold">{liveAnalysis.fault}</div>
                  </div>

                  <div className="mt-auto">
                    <Link to="/register" className="btn btn-hero-cta w-100 py-2">
                      <i className="bi bi-shield-check me-1"></i>Connect Fleet to Monitor Live
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BOTTOM CALL TO ACTION
          ========================================================= */}
      <section className="container mb-5">
        <div className="hero-cta-banner text-center p-4 p-md-5">
          <span className="hero-pill-badge mb-3">
            <i className="bi bi-shield-check me-1"></i> Production Ready Fleet Architecture
          </span>
          <h2 className="display-6 fw-bold mb-3">
            Deploy Predictive AI to Your Fleet in Minutes
          </h2>
          <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '600px' }}>
            Connect vehicle sensors, stream real-time IoT diagnostics, and eliminate unexpected mechanical downtime.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn btn-hero-cta px-4">
              <i className="bi bi-rocket-takeoff me-2"></i>Create Free Account
            </Link>
            <Link to="/login" className="btn btn-hero-secondary px-4">
              <i className="bi bi-box-arrow-in-right me-2"></i>Sign In with Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
