import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Check, AlertCircle, ArrowRight,
  CreditCard, Lock, Sparkles, Clock, FileText, Phone, Mail, User
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function PackageCheckoutModal({ packageData, isOpen, onClose }) {
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-populate if customer is authenticated
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.email) setCustomerEmail(user.email);
      if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [user, isOpen]);

  if (!isOpen || !packageData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please provide a valid email address to receive your order receipt and project updates.');
      return;
    }

    if (!agreeTerms) {
      setError('Please acknowledge the service scope and delivery terms before proceeding.');
      return;
    }

    try {
      setLoading(true);

      const callbackUrl = `${window.location.origin}/payments/callback`;

      const res = await api.payments.initializePackage({
        packageId: packageData.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim() || null,
        notes: notes.trim() || null,
        callbackUrl
      });

      if (res?.data?.authorizationUrl) {
        // Redirect to official Paystack checkout
        window.location.href = res.data.authorizationUrl;
      } else {
        throw new Error('Could not obtain Paystack checkout URL. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment initialization failed. Please verify connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2rem'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-emerald">{packageData.badge || 'One-Time Package'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paystack Direct Checkout</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>
              Order {packageData.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Package Summary Card */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <div>
              <strong style={{ fontSize: '1.15rem', color: '#fff' }}>{packageData.name}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{packageData.deliverable}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
                ₦{packageData.priceNgn.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>One-Time Payment</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Clock size={14} color="var(--accent-emerald)" />
            <span>Expected Timeline: <strong>{packageData.timeline}</strong></span>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem',
            color: '#f87171',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Adebayo Olufemi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Email Address * (For Receipt & Onboarding)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="e.g. founder@mybusiness.ng"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.92rem'
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Paystack checkout verification and order credentials will be dispatched to this address.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Phone / WhatsApp Number (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                placeholder="e.g. +234 803 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Project Notes / Details (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Tell us what you are building or link any existing prototype/notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.88rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Scope & Exclusions Reminder */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.3rem' }}>Package Scope Summary:</div>
            <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li><strong>Deliverable:</strong> {packageData.deliverable}</li>
              <li><strong>Included:</strong> Mobile responsive layout, deployment support, contact integration.</li>
              <li><strong>Exclusions:</strong> Custom domains, paid hosting, and third-party SaaS subscriptions are not included and billed directly by providers.</li>
            </ul>
          </div>

          {/* Terms Agreement Checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', userSelect: 'none', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ accentColor: 'var(--accent-emerald)', marginTop: '2px', width: '16px', height: '16px' }}
            />
            <span>
              I agree to the defined package deliverables, revision policy, and understand custom domains/paid hosting are separate where applicable.
            </span>
          </label>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 800,
              gap: '0.5rem',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <span>Connecting to Paystack...</span>
            ) : (
              <>
                <CreditCard size={18} />
                <span>Pay ₦{packageData.priceNgn.toLocaleString()} via Paystack</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            <Lock size={13} color="var(--accent-emerald)" />
            <span>Protected by 256-bit Paystack Encryption • Cards, USSD, Bank Transfer, Apple Pay</span>
          </div>
        </form>
      </div>
    </div>
  );
}
