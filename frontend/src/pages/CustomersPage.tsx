import { useState, useEffect } from 'react';
import api from '../api/client';
import { Customer, PaginatedResponse } from '../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', tags: '' });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (tagFilter) params.tag = tagFilter;
      const res = await api.get('/customers', { params });
      const data: PaginatedResponse<Customer> = res.data.data;
      setCustomers(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tagFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editCustomer) {
        await api.patch(`/customers/${editCustomer.id}`, payload);
      } else {
        await api.post('/customers', payload);
      }

      setShowModal(false);
      setEditCustomer(null);
      setForm({ name: '', phone: '', email: '', notes: '', tags: '' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      notes: customer.notes || '',
      tags: (customer.tags || []).join(', '),
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditCustomer(null);
    setForm({ name: '', phone: '', email: '', notes: '', tags: '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer list</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Customer
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          className="form-input"
          style={{ width: 200 }}
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No customers found</div>
          <div className="empty-state-text">Add your first customer to get started.</div>
          <button className="btn btn-primary" onClick={openCreate}>Add Customer</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Tags</th>
                  <th>Source</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(c.tags || []).map((tag: string, i: number) => (
                          <span key={i} className="badge badge-active" style={{ fontSize: 11 }}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>{c.source || '-'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={meta.page <= 1}
                onClick={() => fetchCustomers(meta.page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <button
                className="pagination-btn"
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchCustomers(meta.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vip, new, premium" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
