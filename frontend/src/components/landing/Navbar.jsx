import React, { useState } from 'react';
import { Rocket, ShieldCheck, ChevronDown, LogIn, User, Sparkles, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

export default function Navbar({ onNavigatePortal }) {
  const { user, logout, openLogin, openRegister, setIdeaModalOpen, quickDemoLogin } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 9, 17, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.75rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        {/* Brand Logo */}
        <a href="#" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}>
            <Rocket size={20} color="#032014" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>MVPLaunch</span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>NG</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              Nigerian MVP Launch
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hide-on-mobile" style={{ alignItems: 'center', gap: '1.5rem' }}>
          <a href="#how-it-works" className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 600 }}>How It Works</a>
          <a href="#pricing" className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Pricing</a>
          <a href="#why-us" className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Why Us</a>
          <a href="#reviews" className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reviews</a>
          <a href="#faq" className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 600 }}>FAQ</a>
        </div>

        {/* Actions & Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Quick Demo Switcher (Desktop) */}
          <div className="hide-on-mobile" style={{ position: 'relative' }}>
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                color: '#c7d2fe',
                gap: '0.35rem'
              }}
              title="Test all 3 roles instantly with pre-seeded demo accounts"
            >
              <Sparkles size={14} color="#818cf8" />
              <span>Demo Accounts</span>
              <ChevronDown size={14} />
            </button>

            {demoMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '280px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.6rem',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, padding: '0.4rem 0.5rem' }}>
                  1-Click Role Logins
                </div>
                {DEMO_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      try {
                        await quickDemoLogin(acc);
                        setDemoMenuOpen(false);
                        onNavigatePortal(acc.role.toLowerCase());
                      } catch (err) {
                        alert(err.message || 'Demo login failed. Make sure the backend server is running on port 5005.');
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{acc.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{acc.tag}</div>
                    </div>
                    <span className={`badge ${acc.role === 'ADMIN' ? 'badge-amber' : acc.role === 'DEVELOPER' ? 'badge-indigo' : 'badge-emerald'}`}>
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            /* Authenticated User Menu */
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.5rem', borderColor: 'var(--accent-emerald-dark)' }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald-dark)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {user.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name?.split(' ')[0] || user.email}
                </span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '220px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.6rem',
                  zIndex: 200
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <span className="badge badge-emerald" style={{ marginTop: '0.35rem' }}>{user.role}</span>
                  </div>

                  <button
                    onClick={() => {
                      onNavigatePortal(user.role.toLowerCase());
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-emerald-light)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LayoutDashboard size={16} />
                    <span>Open {user.role} Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-rose)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogIn size={16} style={{ transform: 'rotate(180deg)' }} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest Actions */
            <>
              <button onClick={openLogin} className="btn btn-ghost btn-sm hide-on-mobile" style={{ fontWeight: 600 }}>
                Sign In
              </button>
              <button
                onClick={() => setIdeaModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              >
                <span>Start MVP</span>
                <span className="hide-on-mobile">→</span>
              </button>
            </>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="show-on-mobile btn btn-secondary btn-sm"
            style={{ padding: '0.45rem', minWidth: '40px', minHeight: '40px', color: '#fff' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-card)',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Nav Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
            <a
              href="#how-it-works"
              onClick={closeMobile}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={closeMobile}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-emerald-light)' }}
            >
              Launch Packages (₦5k – ₦35k)
            </a>
            <a
              href="#why-us"
              onClick={closeMobile}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Why Us
            </a>
            <a
              href="#reviews"
              onClick={closeMobile}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Verified Reviews
            </a>
            <a
              href="#faq"
              onClick={closeMobile}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              FAQ
            </a>
          </div>

          {/* Quick Demo Accounts for Testing */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={13} color="#818cf8" />
              <span>1-Click Demo Accounts</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem' }}>
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    try {
                      await quickDemoLogin(acc);
                      closeMobile();
                      onNavigatePortal(acc.role.toLowerCase());
                    } catch (err) {
                      alert(err.message || 'Demo login failed');
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', justifyContent: 'space-between', padding: '0.4rem 0.6rem' }}
                >
                  <span>{acc.title}</span>
                  <span className={`badge ${acc.role === 'ADMIN' ? 'badge-amber' : acc.role === 'DEVELOPER' ? 'badge-indigo' : 'badge-emerald'}`} style={{ fontSize: '0.65rem', padding: '1px 4px' }}>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auth Actions on Mobile */}
          {!user ? (
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button
                onClick={() => { closeMobile(); openLogin(); }}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, minHeight: '44px' }}
              >
                Sign In
              </button>
              <button
                onClick={() => { closeMobile(); setIdeaModalOpen(true); }}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, minHeight: '44px' }}
              >
                Start My MVP →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => { closeMobile(); onNavigatePortal(user.role.toLowerCase()); }}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', minHeight: '44px', gap: '0.5rem' }}
              >
                <LayoutDashboard size={16} />
                <span>Open {user.role} Workspace</span>
              </button>
              <button
                onClick={() => { closeMobile(); logout(); }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', color: 'var(--accent-rose)', minHeight: '44px' }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
