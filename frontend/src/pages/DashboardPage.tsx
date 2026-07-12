import { useState, useEffect } from 'react';
import api from '../api/client';
import { DashboardStats, Conversation } from '../types';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your overview.</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#166534' }}>👥</div>
          <div className="stat-card-value">{stats?.totalCustomers || 0}</div>
          <div className="stat-card-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>💬</div>
          <div className="stat-card-value">{stats?.activeConversations || 0}</div>
          <div className="stat-card-label">Active Conversations</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#92400e' }}>📨</div>
          <div className="stat-card-value">{stats?.todayMessages || 0}</div>
          <div className="stat-card-label">Today's Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#e0e7ff', color: '#3730a3' }}>📊</div>
          <div className="stat-card-value">{stats?.totalCampaigns || 0}</div>
          <div className="stat-card-label">Total Campaigns</div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Recent Conversations
        </h2>
        <div className="card">
          {stats?.recentConversations && stats.recentConversations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Last Message</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentConversations.map((conv: Conversation) => (
                  <tr key={conv.id}>
                    <td style={{ fontWeight: 500 }}>{conv.customer?.name || 'Unknown'}</td>
                    <td>
                      <span className={`badge badge-${conv.status}`}>{conv.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.messages?.[0]?.content || 'No messages'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/conversations`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No conversations yet</div>
              <div className="empty-state-text">
                When customers start messaging, their conversations will appear here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
