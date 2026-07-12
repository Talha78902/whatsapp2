import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import api from '../api/client';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [messagesOverTime, setMessagesOverTime] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, messagesRes, customersRes, campaignRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/messages', { params: { days: 30 } }),
          api.get('/analytics/customers', { params: { days: 30 } }),
          api.get('/analytics/campaigns'),
        ]);
        setOverview(overviewRes.data.data);
        setMessagesOverTime(messagesRes.data.data || []);
        setCustomerGrowth(customersRes.data.data || []);
        setCampaignStats(campaignRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track your business performance</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Customers</div>
          <div className="stat-card-value">{overview?.totalCustomers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Conversations</div>
          <div className="stat-card-value">{overview?.totalConversations || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Messages</div>
          <div className="stat-card-value">{overview?.totalMessages || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Campaigns</div>
          <div className="stat-card-value">{overview?.totalCampaigns || 0}</div>
        </div>
      </div>

      {campaignStats && (
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-card-label" style={{ color: 'var(--success)' }}>Delivered</div>
            <div className="stat-card-value">{campaignStats.totalDelivered}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label" style={{ color: 'var(--info)' }}>Read</div>
            <div className="stat-card-value">{campaignStats.totalRead}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label" style={{ color: 'var(--warning)' }}>Sent</div>
            <div className="stat-card-value">{campaignStats.totalSent}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label" style={{ color: 'var(--danger)' }}>Failed</div>
            <div className="stat-card-value">{campaignStats.totalFailed}</div>
          </div>
        </div>
      )}

      <div className="analytics-grid">
        <div className="chart-container">
          <h3 className="chart-title">Messages Over Time (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={messagesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Bar dataKey="inbound" fill="#25D366" name="Inbound" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outbound" fill="#128C7E" name="Outbound" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#25D366" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
