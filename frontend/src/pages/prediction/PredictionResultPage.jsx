import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function PredictionResultPage() {
  const { vehicleId } = useParams();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLatestPrediction() {
      if (!result) {
        try {
          const [vRes, pRes] = await Promise.all([
            api.get(`/vehicles/${vehicleId}`),
            api.get(`/predictions/vehicle/${vehicleId}`)
          ]);

          setVehicle(vRes.data?.vehicle);
          const alerts = pRes.data?.alerts || [];
          if (alerts.length > 0) {
            const latest = alerts[0];
            const exp = latest.explanations?.[0];
            setResult({
              predictionId: latest.id,
              riskScore: latest.risk_score,
              riskLevel: latest.risk_level,
              predictedFaultType: latest.predicted_fault_type,
              explanation: exp?.explanation_text || 'No explanation recorded.',
              modelName: exp?.model_name || 'Groq LLaMA 3.3',
              mode: exp?.mode || 'QUICK',
              createdAt: latest.created_at
            });
          } else {
            setError('No prediction records found for this vehicle.');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load diagnostic record.');
        } finally {
          setLoading(false);
        }
      }
    }

    loadLatestPrediction();
  }, [vehicleId, result]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Generating or retrieving AI Diagnostic..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1" style={{ maxWidth: '860px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="eyebrow mb-1">
              <i className="bi bi-cpu-fill me-1"></i>Diagnostic Intelligence
            </div>
            <h2 className="fw-bold mb-0">AI Diagnostic Report</h2>
            {vehicle && (
              <p className="text-muted small mb-0">
                Asset: <strong>{vehicle.name}</strong> ({vehicle.make} {vehicle.model}) • VIN: <code>{vehicle.vin || 'N/A'}</code>
              </p>
            )}
          </div>
          <div className="d-flex gap-2">
            <Link to={`/vehicles/${vehicleId}`} className="btn btn-sm btn-outline-dark">
              <i className="bi bi-arrow-left me-1"></i>HUD Station
            </Link>
            <button type="button" className="btn btn-sm btn-dark" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i>Print Report
            </button>
          </div>
        </div>

        <FlashAlert error={error} />

        {result && (
          <div className="card shadow-sm border-0 overflow-hidden mb-4">
            <div className="card-header bg-dark text-white p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="badge bg-info text-dark mb-2">
                    {result.mode === 'DEEP' ? '🔍 Deep Diagnostic Report (RAG Grounded)' : '⚡ Quick Health Assessment'}
                  </span>
                  <h3 className="fw-bold mb-1">{result.predictedFaultType}</h3>
                  <div className="small text-light opacity-75">
                    Evaluated: {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>
                <div className="text-md-end">
                  <span
                    className={`badge fs-6 ${
                      result.riskLevel === 'HIGH'
                        ? 'bg-danger'
                        : result.riskLevel === 'MEDIUM'
                        ? 'bg-warning text-dark'
                        : 'bg-success'
                    }`}
                  >
                    {result.riskLevel} RISK
                  </span>
                  <div className="fs-3 fw-bold text-white mt-1">
                    {Number(result.riskScore).toFixed(1)} <span className="fs-6 text-muted">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              <h5 className="fw-bold mb-3 text-primary">
                <i className="bi bi-robot me-2"></i>Comprehensive AI Diagnostic Findings:
              </h5>
              <div
                className="bg-light p-4 rounded-3 border mb-4"
                style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '0.95rem' }}
              >
                {result.explanation}
              </div>

              <div className="d-flex justify-content-between align-items-center text-muted small pt-3 border-top flex-wrap gap-2">
                <div>
                  Inference Model: <code>{result.modelName || 'Groq LLaMA 3.3'}</code>
                </div>
                <div>
                  Vector RAG Store: <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Grounded in OEM Manuals</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
