import { useState, useEffect } from 'react';
import api from '../api/client';
import { KnowledgeBaseEntry, PaginatedResponse } from '../types';

export default function AiPage() {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [kbEntries, setKbEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' });
  const [askQuestion, setAskQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const fetchKb = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge-base', { params: { page, limit: 20 } });
      const data: PaginatedResponse<KnowledgeBaseEntry> = res.data.data;
      setKbEntries(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'knowledge') fetchKb();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editEntry) {
        await api.put(`/knowledge-base/${editEntry.id}`, form);
      } else {
        await api.post('/knowledge-base', form);
      }
      setShowModal(false);
      setEditEntry(null);
      setForm({ question: '', answer: '', category: 'general' });
      fetchKb();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (entry: KnowledgeBaseEntry) => {
    setEditEntry(entry);
    setForm({ question: entry.question, answer: entry.answer, category: entry.category });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.delete(`/knowledge-base/${id}`);
      fetchKb();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAsk = async () => {
    if (!askQuestion.trim()) return;
    setAsking(true);
    try {
      const res = await api.post('/ai/ask', { question: askQuestion });
      setAiAnswer(res.data.data.answer);
    } catch (err) {
      setAiAnswer('Failed to get answer. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Manage knowledge base and AI responses</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          Knowledge Base
        </button>
        <button
          className={`tab ${activeTab === 'ask' ? 'active' : ''}`}
          onClick={() => setActiveTab('ask')}
        >
          Ask AI
        </button>
      </div>

      {activeTab === 'knowledge' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => {
              setEditEntry(null);
              setForm({ question: '', answer: '', category: 'general' });
              setShowModal(true);
            }}>
              + Add Entry
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : kbEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No knowledge base entries</div>
              <div className="empty-state-text">Add FAQs and answers for the AI to use.</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kbEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: 500, maxWidth: 200 }}>{entry.question}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.answer}
                      </td>
                      <td><span className="badge badge-active">{entry.category}</span></td>
                      <td>
                        <span className={`badge ${entry.isActive ? 'badge-approved' : 'badge-inactive'}`}>
                          {entry.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(entry)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ask' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Ask the AI Assistant</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Ask a question and the AI will answer based on your knowledge base.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="form-input"
              placeholder="Type your question..."
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAsk();
              }}
            />
            <button className="btn btn-primary" onClick={handleAsk} disabled={asking}>
              {asking ? 'Thinking...' : 'Ask'}
            </button>
          </div>
          {aiAnswer && (
            <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Answer:</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{aiAnswer}</div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editEntry ? 'Edit Entry' : 'Add Knowledge Base Entry'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question *</label>
                <input className="form-input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Answer *</label>
                <textarea className="form-textarea" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editEntry ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
