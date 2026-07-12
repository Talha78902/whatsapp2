import { useState, useEffect } from 'react';
import api from '../api/client';
import { Template, PaginatedResponse } from '../types';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'marketing',
    language: 'en',
    body: '',
    header: '',
    footer: '',
  });

  const fetchTemplates = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/templates', { params: { page, limit: 20 } });
      const data: PaginatedResponse<Template> = res.data.data;
      setTemplates(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editTemplate) {
        await api.patch(`/templates/${editTemplate.id}`, form);
      } else {
        await api.post('/templates', form);
      }
      setShowModal(false);
      setEditTemplate(null);
      setForm({ name: '', category: 'marketing', language: 'en', body: '', header: '', footer: '' });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (tpl: Template) => {
    setEditTemplate(tpl);
    setForm({
      name: tpl.name,
      category: tpl.category,
      language: tpl.language,
      body: tpl.body,
      header: tpl.header || '',
      footer: tpl.footer || '',
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditTemplate(null);
    setForm({ name: '', category: 'marketing', language: 'en', body: '', header: '', footer: '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'badge-approved',
      pending: 'badge-pending',
      rejected: 'badge-rejected',
    };
    return map[status] || 'badge-pending';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Message Templates</h1>
          <p className="page-subtitle">Manage WhatsApp message templates</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + New Template
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No templates yet</div>
          <div className="empty-state-text">Create your first message template.</div>
          <button className="btn btn-primary" onClick={openCreate}>Create Template</button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Language</th>
                <th>Status</th>
                <th>Body Preview</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td><span className="badge badge-active">{t.category}</span></td>
                  <td>{t.language}</td>
                  <td><span className={`badge ${getStatusBadge(t.status)}`}>{t.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.body}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editTemplate ? 'Edit Template' : 'New Template'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="marketing">Marketing</option>
                    <option value="utility">Utility</option>
                    <option value="authentication">Authentication</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <input className="form-input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Header (optional)</label>
                <input className="form-input" value={form.header} onChange={(e) => setForm({ ...form, header: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Body *</label>
                <textarea className="form-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required placeholder="Use {{1}} for variables" />
              </div>
              <div className="form-group">
                <label className="form-label">Footer (optional)</label>
                <input className="form-input" value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
