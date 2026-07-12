import { useState, useEffect } from 'react';
import api from '../api/client';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then((res) => setSettings(res.data.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.post('/settings', settings);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your business settings</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 500,
            background: message.includes('success') ? '#dcfce7' : '#fee2e2',
            color: message.includes('success') ? '#166534' : '#991b1b',
          }}
        >
          {message}
        </div>
      )}

      <div className="card" style={{ maxWidth: 600 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Business Information</h3>

        <div className="form-group">
          <label className="form-label">Business Name</label>
          <input
            className="form-input"
            value={settings.business_name || ''}
            onChange={(e) => updateSetting('business_name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Business Hours</label>
          <input
            className="form-input"
            value={settings.business_hours || ''}
            onChange={(e) => updateSetting('business_hours', e.target.value)}
            placeholder="Mon-Fri 9AM-6PM"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Default Language</label>
          <input
            className="form-input"
            value={settings.default_language || 'en'}
            onChange={(e) => updateSetting('default_language', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 0 }}>AI Assistant Enabled</label>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Allow AI to auto-reply to customers
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.ai_enabled === 'true'}
              onChange={(e) => updateSetting('ai_enabled', e.target.checked ? 'true' : 'false')}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>WhatsApp Configuration</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Configure your WhatsApp API settings in the backend .env file.
        </p>

        <div className="form-group">
          <label className="form-label">Phone Number ID</label>
          <input
            className="form-input"
            value={settings.whatsapp_phone_number_id || ''}
            onChange={(e) => updateSetting('whatsapp_phone_number_id', e.target.value)}
            placeholder="Set in environment variables"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Business Account ID</label>
          <input
            className="form-input"
            value={settings.whatsapp_business_account_id || ''}
            onChange={(e) => updateSetting('whatsapp_business_account_id', e.target.value)}
            placeholder="Set in environment variables"
          />
        </div>
      </div>
    </div>
  );
}
