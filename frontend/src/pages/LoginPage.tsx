import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, firstName, lastName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">T</div>
          <h1 className="login-title">Talha WhatsApp</h1>
          <p className="login-subtitle">Business Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: 6,
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@talha.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-dark)',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : 'Don\'t have an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
