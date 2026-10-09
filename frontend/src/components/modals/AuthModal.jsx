import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    closeAuthModal
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSwitchMode = (mode) => {
    setAuthModalMode(mode);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const cleanPhone = phoneNumber.trim() || null;

    // Client-side validations for immediate clear feedback
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (authModalMode === 'register') {
      if (!cleanFullName || cleanFullName.length < 2) {
        setError('Full name must be at least 2 characters.');
        return;
      }

      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter (A-Z).');
        return;
      }

      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number (0-9).');
        return;
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(cleanEmail, password);
      } else {
        await register({
          email: cleanEmail,
          password,
          fullName: cleanFullName,
          phoneNumber: cleanPhone,
          role: role || 'CLIENT'
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, calc(100vw - 1.5rem))',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 800 }}>
              {authModalMode === 'login' ? 'Sign in to MVPLaunch NG' : 'Create Your Builder Account'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem', marginBottom: 0 }}>
              {authModalMode === 'login'
                ? 'Access your active MVP projects, milestones & code'
                : 'Turn your validated idea into deployable software'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, flexShrink: 0 }}
            aria-label="Close authentication modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem'
          }}
        >
          <button
            role="tab"
            aria-selected={authModalMode === 'login'}
            type="button"
            onClick={() => handleSwitchMode('login')}
            style={{
              flex: 1,
              padding: '0.65rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: authModalMode === 'login' ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
              borderBottom: authModalMode === 'login' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={authModalMode === 'register'}
            type="button"
            onClick={() => handleSwitchMode('register')}
            style={{
              flex: 1,
              padding: '0.65rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: authModalMode === 'register' ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
              borderBottom: authModalMode === 'register' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Feedback Banner */}
        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              lineHeight: 1.45
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} noValidate>
          {authModalMode === 'register' && (
            <>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="auth-fullName" className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Chioma Adeleke"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="auth-phoneNumber" className="form-label">Phone Number (WhatsApp Preferred)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+234 814 555 6677"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="auth-role" className="form-label">Your Role</label>
                <select
                  id="auth-role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="CLIENT">Client / Founder (I have an idea to build)</option>
                  <option value="DEVELOPER">MVP Developer (I want to build vetted projects)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="auth-email" className="form-label">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: authModalMode === 'register' ? '0.75rem' : '1.25rem' }}>
            <label htmlFor="auth-password" className="form-label">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              autoComplete={authModalMode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              disabled={loading}
            />
            {authModalMode === 'register' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                Must be at least 8 characters, with 1 uppercase letter (A-Z) and 1 number (0-9).
              </p>
            )}
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <span>
              {loading
                ? 'Please wait...'
                : authModalMode === 'login'
                ? 'Sign In to Workspace'
                : 'Register Account'}
            </span>
            {!loading && <ArrowRight size={16} />}
          </button>

          <button
            id="auth-cancel-btn"
            type="button"
            onClick={closeAuthModal}
            className="btn btn-ghost"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.65rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              justifyContent: 'center'
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
