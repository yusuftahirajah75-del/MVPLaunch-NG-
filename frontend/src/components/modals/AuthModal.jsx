import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login, register, quickDemoLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, fullName, phoneNumber, role });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
              {authModalMode === 'login' ? 'Sign in to MVPLaunch NG' : 'Create Your Builder Account'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {authModalMode === 'login'
                ? 'Access your active MVP projects, milestones & code'
                : 'Turn your validated idea into deployable software'}
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            style={{ color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1-Click Demo Quick Logins */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            <Sparkles size={14} />
            <span>Instant Demo Logins (Pre-Seeded Test Roles)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((acc, i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    await quickDemoLogin(acc);
                  } catch (err) {
                    setError(err.message || 'Demo login failed. Make sure backend is running on port 5005.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.5rem',
                  justifyContent: 'center',
                  background: 'var(--bg-surface)'
                }}
              >
                {acc.title}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: authModalMode === 'login' ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
              borderBottom: authModalMode === 'login' ? '2px solid var(--accent-emerald)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: authModalMode === 'register' ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
              borderBottom: authModalMode === 'register' ? '2px solid var(--accent-emerald)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: '#fda4af',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {authModalMode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Chioma Adeleke"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (WhatsApp Preferred)</label>
                <input
                  type="tel"
                  placeholder="+234 814 555 6677"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="CLIENT">Client / Founder (I have an idea to build)</option>
                  <option value="DEVELOPER">MVP Developer (I want to build vetted projects)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            <span>{loading ? 'Please wait...' : authModalMode === 'login' ? 'Sign In to Workspace' : 'Register Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
