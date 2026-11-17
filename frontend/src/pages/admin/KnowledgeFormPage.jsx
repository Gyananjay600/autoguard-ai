import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function KnowledgeFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cooling System',
    content: ''
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      async function loadArticle() {
        try {
          const res = await api.get('/admin/panel');
          const articles = res.data?.articles || [];
          const matched = articles.find((a) => String(a.id) === String(id));
          if (matched) {
            setFormData({
              title: matched.title || '',
              category: matched.category || 'Cooling System',
              content: matched.content || ''
            });
          }
        } catch (err) {
          setError('Failed to load article.');
        } finally {
          setLoading(false);
        }
      }
      loadArticle();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Article title is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/admin/knowledge/${id}`, formData);
      } else {
        await api.post('/admin/knowledge', formData);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save knowledge article.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Retrieving article content..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1" style={{ maxWidth: '800px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="eyebrow mb-1"><i className="bi bi-book-fill me-1"></i>RAG Knowledge Base</div>
            <h2 className="fw-bold mb-0">{isEdit ? 'Edit Maintenance Bulletin' : 'Author Technical Bulletin'}</h2>
          </div>
          <Link to="/admin" className="btn btn-sm btn-outline-dark">
            <i className="bi bi-arrow-left me-1"></i>Back to Panel
          </Link>
        </div>

        <FlashAlert error={error} onClose={() => setError('')} />

        <div className="card shadow-sm p-4 border">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="title">Bulletin / Article Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                placeholder="e.g. Engine Overheating & Radiator Fan Relay Continuity Diagnostics"
                value={formData.title}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="category">Subsystem Category</label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Cooling System">Cooling System</option>
                <option value="Lubrication">Lubrication &amp; Oil Circulation</option>
                <option value="Drivetrain">Drivetrain &amp; Engine Mounts</option>
                <option value="Diagnostics">OBD-II Powertrain Diagnostics</option>
                <option value="Electrical & Sensors">Electrical &amp; Sensor Wiring</option>
                <option value="Braking & Safety">Braking &amp; Safety</option>
                <option value="General">General Maintenance</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="content">OEM Manual Content / Technical Repair Guidelines *</label>
              <textarea
                id="content"
                name="content"
                className="form-control font-monospace"
                rows="9"
                placeholder="Detailed mechanical thresholds, step-by-step diagnostic sequences, pinout tests, and corrective action instructions for generative RAG embedding..."
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
              <div className="form-text small">
                This content is parsed and indexed by our semantic search engine to ground Groq AI diagnostics in verified mechanical facts.
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Link to="/admin" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-dark px-4" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Indexing into RAG Store...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i>Save &amp; Index Article
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
