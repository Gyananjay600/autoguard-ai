import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function VehicleFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: '',
    engineType: 'Standard Inline-4',
    vin: ''
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      async function loadVehicle() {
        try {
          const res = await api.get(`/vehicles/${id}`);
          const v = res.data?.vehicle;
          if (v) {
            setFormData({
              name: v.name || '',
              make: v.make || '',
              model: v.model || '',
              year: v.year || 2024,
              mileage: v.mileage || '',
              engineType: v.engine_type || v.engineType || 'Standard Inline-4',
              vin: v.vin || ''
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load vehicle details.');
        } finally {
          setLoading(false);
        }
      }
      loadVehicle();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/vehicles/${id}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save vehicle.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Retrieving vehicle specifications..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1" style={{ maxWidth: '780px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="eyebrow mb-1">
              <i className="bi bi-gear-fill me-1"></i>Fleet Configuration
            </div>
            <h2 className="fw-bold mb-0">{isEdit ? 'Edit Vehicle Specifications' : 'Register New Fleet Asset'}</h2>
          </div>
          <Link to="/vehicles" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back to Garage
          </Link>
        </div>

        <FlashAlert error={error} onClose={() => setError('')} />

        <div className="card shadow-sm p-4 border">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="name">Vehicle Display Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Delivery Van #04 or Alex's Daily Driver"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="make">Manufacturer / Make *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  className="form-control"
                  placeholder="e.g. Toyota, Ford, Tesla"
                  value={formData.make}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="model">Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  className="form-control"
                  placeholder="e.g. Camry Hybrid, F-150, Model 3"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="year">Model Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  className="form-control"
                  min="1980"
                  max="2035"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="mileage">Current Odometer (km)</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  className="form-control"
                  placeholder="e.g. 45000"
                  value={formData.mileage}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="engineType">Powertrain / Engine</label>
                <select
                  id="engineType"
                  name="engineType"
                  className="form-select"
                  value={formData.engineType}
                  onChange={handleChange}
                >
                  <option value="2.5L 4-Cylinder Hybrid">2.5L 4-Cylinder Hybrid</option>
                  <option value="3.5L V6 Twin-Turbo">3.5L V6 Twin-Turbo</option>
                  <option value="5.0L V8 Coyote">5.0L V8</option>
                  <option value="Dual Motor Electric AWD">Dual Motor Electric AWD</option>
                  <option value="Single Motor RWD EV">Single Motor RWD EV</option>
                  <option value="2.0L Turbo Diesel">2.0L Turbo Diesel</option>
                  <option value="Standard Inline-4">Standard Inline-4</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="vin">Vehicle Identification Number (VIN)</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  className="form-control"
                  placeholder="17-character VIN (e.g. 1HGCR2F83HA029182)"
                  value={formData.vin}
                  onChange={handleChange}
                />
                <div className="form-text small">
                  VIN is used to index vehicle technical bulletins and official OEM recalls.
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Link to="/vehicles" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-hero-cta px-4" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Vehicle...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i>
                    {isEdit ? 'Update Vehicle' : 'Register Vehicle & Seed History'}
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
