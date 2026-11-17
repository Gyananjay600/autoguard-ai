import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlashAlert from '../../components/common/FlashAlert';

export default function AdminPanelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [kbSearch, setKbSearch] = useState('');
  const [activeTab, setActiveTab] = useState('knowledge'); // 'knowledge' | 'users' | 'logs'

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/panel');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load admin panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteArticle = async (id, title) => {
    if (!window.confirm(`Delete knowledge article "${title}"?`)) return;

    try {
      await api.delete(`/admin/knowledge/${id}`);
      setSuccess(`Article "${title}" removed.`);
      await fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete article.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      setSuccess(`User role updated to ${newRole}.`);
      await fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <LoadingSpinner fullPage text="Accessing Admin Secure Operations Center..." />
        <Footer />
      </div>
    );
  }

  const articles = data?.articles || [];
  const users = data?.users || [];
  const aiLogs = data?.aiLogs || [];
  const stats = data?.stats || {};

  const filteredArticles = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(kbSearch.toLowerCase()) ||
      a.category?.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        <FlashAlert success={success} error={error} onClose={() => { setSuccess(''); setError(''); }} />

        {/* Admin Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <div className="eyebrow text-danger mb-1"><i className="bi bi-shield-lock-fill me-1"></i>Security Clearance: ADMIN</div>
            <h2 className="fw-bold mb-0">Admin Control Center</h2>
            <p className="text-muted small mb-0">
              Manage RAG knowledge base articles, user role authorizations, and review system AI request logs.
            </p>
          </div>
        </div>

        {/* Quick Admin Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm p-3 bg-white border">
              <div className="small text-muted text-uppercase fw-bold">Total AI Diagnostic Inferences</div>
              <div className="fs-3 fw-bold text-dark">{stats.totalAiRequests || aiLogs.length}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3 bg-white border">
              <div className="small text-muted text-uppercase fw-bold">Average Inference Latency</div>
              <div className="fs-3 fw-bold text-dark">{stats.avgLatencyMs ? `${stats.avgLatencyMs} ms` : '850 ms'}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3 bg-white border">
              <div className="small text-muted text-uppercase fw-bold">High Risk Detections</div>
              <div className="fs-3 fw-bold text-danger">{stats.totalHighRiskFlags || 0}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveTab('knowledge')}
            >
              <i className="bi bi-book me-1.5 text-primary"></i>RAG Knowledge Articles ({articles.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people me-1.5 text-primary"></i>User Roles &amp; Access ({users.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <i className="bi bi-journal-text me-1.5 text-primary"></i>AI Request Audit Logs ({aiLogs.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Knowledge Articles */}
        {activeTab === 'knowledge' && (
          <div className="card panel-table shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
              <span className="fw-bold"><i className="bi bi-journal-bookmark me-2 text-primary"></i>Technical Service Manuals</span>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search articles..."
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  style={{ width: '200px' }}
                />
                <Link to="/admin/knowledge/new" className="btn btn-sm btn-dark">
                  <i className="bi bi-plus-lg me-1"></i>New Article
                </Link>
              </div>
            </div>

            <div className="card-body p-0 table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((a) => (
                      <tr key={a.id}>
                        <td className="fw-bold text-dark">{a.title}</td>
                        <td><span className="badge bg-secondary">{a.category || 'General'}</span></td>
                        <td className="text-end">
                          <Link to={`/admin/knowledge/${a.id}/edit`} className="btn btn-sm btn-outline-secondary me-1">
                            <i className="bi bi-pencil me-1"></i>Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteArticle(a.id, a.title)}
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted small">
                        No articles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: User Roles */}
        {activeTab === 'users' && (
          <div className="card panel-table shadow-sm">
            <div className="card-header py-3 fw-bold">
              <i className="bi bi-people me-2 text-primary"></i>User Authorization &amp; Fleet Scopes
            </div>
            <div className="card-body p-0 table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th className="text-end">Update Access</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-bold text-dark">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'ADMIN' ? 'bg-danger' : u.role === 'ENGINEER' ? 'bg-primary' : 'bg-secondary'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block"
                          style={{ width: 'auto' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="OWNER">OWNER</option>
                          <option value="ENGINEER">ENGINEER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: AI Request Audit Logs */}
        {activeTab === 'logs' && (
          <div className="card panel-table shadow-sm">
            <div className="card-header py-3 fw-bold">
              <i className="bi bi-cpu me-2 text-primary"></i>AI Inference Audit History ({aiLogs.length} events)
            </div>
            <div className="card-body p-0 table-responsive" style={{ maxHeight: '500px' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark sticky-top">
                  <tr>
                    <th>Timestamp</th>
                    <th>Model</th>
                    <th>Mode</th>
                    <th>Latency</th>
                    <th>Vehicle</th>
                    <th>Predicted Fault</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {aiLogs.length > 0 ? (
                    aiLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="small text-muted">{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                        <td><code>{log.model_name}</code></td>
                        <td>
                          <span className={`badge ${log.mode === 'DEEP' ? 'bg-info text-dark' : 'bg-primary'}`}>
                            {log.mode}
                          </span>
                        </td>
                        <td>{log.latency_ms ? `${log.latency_ms} ms` : '-'}</td>
                        <td className="fw-semibold text-dark">{log.vehicle_name}</td>
                        <td className="small">{log.predicted_fault}</td>
                        <td>
                          <span
                            className={`badge ${
                              log.risk_level === 'HIGH'
                                ? 'bg-danger'
                                : log.risk_level === 'MEDIUM'
                                ? 'bg-warning text-dark'
                                : 'bg-success'
                            }`}
                          >
                            {log.risk_level} ({log.risk_score ? Number(log.risk_score).toFixed(0) : 0})
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted small">
                        No AI inference logs logged yet.
                      </td>
                    </tr>
                  )}
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
