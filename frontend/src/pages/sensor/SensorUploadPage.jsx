import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function SensorUploadPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    engineTemp: '',
    oilPressure: '',
    rpm: '',
    vibration: '',
    errorCode: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await api.get('/vehicles');
        const list = res.data?.vehicles || [];
        setVehicles(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, vehicleId: list[0].id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vehicles list.');
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      setError('Please select a vehicle.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await api.post('/sensors/upload', formData);
      setSuccess('Sensor telemetry reading logged successfully.');
      setTimeout(() => {
        navigate(`/vehicles/${formData.vehicleId}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save sensor reading.');
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Loading telemetry upload form..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1" style={{ maxWidth: '720px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="eyebrow mb-1"><i className="bi bi-broadcast me-1"></i>Manual Telemetry</div>
            <h2 className="fw-bold mb-0">Log IoT Sensor Reading</h2>
            <p className="text-muted small mb-0">Record real-time or field-calibrated sensor data points.</p>
          </div>
          <Link to="/vehicles" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>Garage
          </Link>
        </div>

        <FlashAlert success={success} error={error} onClose={() => { setSuccess(''); setError(''); }} />

        <div className="card shadow-sm p-4 border">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="vehicleId">Target Fleet Asset *</label>
                <select
                  id="vehicleId"
                  name="vehicleId"
                  className="form-select"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.make} {v.model}) — VIN: {v.vin || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="engineTemp">Engine Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  id="engineTemp"
                  name="engineTemp"
                  className="form-control"
                  placeholder="Normal: 80 - 95°C"
                  value={formData.engineTemp}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="oilPressure">Oil Pressure (PSI)</label>
                <input
                  type="number"
                  step="0.1"
                  id="oilPressure"
                  name="oilPressure"
                  className="form-control"
                  placeholder="Normal: 35 - 65 PSI"
                  value={formData.oilPressure}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="rpm">Engine RPM</label>
                <input
                  type="number"
                  id="rpm"
                  name="rpm"
                  className="form-control"
                  placeholder="Normal: 800 - 3500 RPM"
                  value={formData.rpm}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="vibration">Vibration Index (G)</label>
                <input
                  type="number"
                  step="0.01"
                  id="vibration"
                  name="vibration"
                  className="form-control"
                  placeholder="Normal: 0.1 - 0.5 G"
                  value={formData.vibration}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="errorCode">OBD-II DTC Error Code (Optional)</label>
                <input
                  type="text"
                  id="errorCode"
                  name="errorCode"
                  className="form-control"
                  placeholder="e.g. P0217, P0520, P0300"
                  value={formData.errorCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Link to="/vehicles" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-hero-cta px-4" disabled={uploading}>
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Logging Reading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-1"></i>Save &amp; View In HUD
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
