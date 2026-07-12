import { useState, useEffect } from 'react';
import api from '../api/client';
import { Campaign, PaginatedResponse } from '../types';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'marketing',
    scheduledAt: '',
    templateId: '',
    customerIds: [] as string[],
  });

  const fetchCampaigns = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/campaigns', { params });
      const data: PaginatedResponse<Campaign> = res.data.data;
      setCampaigns(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const openCreate = async () => {
    try {
      const [tplRes, custRes] = await Promise.all([
        api.get('/templates', { params: { limit: 100 } }),
        api.get('/customers', { params: { limit: 100 } }),
      ]);
      setTemplates(tplRes.data.data.data || []);
      setCustomers(custRes.data.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setForm({ name: '', description: '', type: 'marketing', scheduledAt: '', templateId: '', customerIds: [] });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', form);
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCustomer = (id: string) => {
    setForm((prev) => ({
      ...prev,
      customerIds: prev.customerIds.includes(id)
        ? prev.customerIds.filter((c) => c !== id)
        : [...prev.customerIds, id],
    }));
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'badge-draft',
      scheduled: 'badge-scheduled',
      sending: 'badge-sending',
      sent: 'badge-sent',
      cancelled: 'badge-cancelled',
    };
    return map[status] || 'badge-draft';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Create and manage WhatsApp campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + New Campaign
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No campaigns yet</div>
          <div className="empty-state-text">Create your first campaign to start sending messages.</div>
          <button className="btn btn-primary" onClick={openCreate}>Create Campaign</button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Scheduled</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className="badge badge-active">{c.type}</span></td>
                  <td><span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span></td>
                  <td>{c._count?.messages || 0}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2 className="modal-title">New Campaign</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="marketing">Marketing</option>
                    <option value="utility">Utility</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Template</label>
                  <select className="form-select" value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>
                    <option value="">No template</option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Schedule (optional)</label>
                <input className="form-input" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Select Customers *</label>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 6, padding: 8 }}>
                  {customers.map((c: any) => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', borderRadius: 4, fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={form.customerIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                      />
                      {c.name} - {c.phone}
                    </label>
                  ))}
                  {customers.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: 8 }}>No customers available</div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
