import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, AlertCircle, RefreshCw, ArrowRight,
  ShieldCheck, FileText, Home, ExternalLink, Mail, Phone, Clock
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function PaymentCallback({ onBackToHome, onNavigatePortal }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [reference, setReference] = useState('');

  useEffect(() => {
    async function verifyCheckout() {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('reference') || params.get('trxref');
      const status = params.get('status');

      if (status === 'cancelled') {
        setCancelled(true);
        setLoading(false);
        return;
      }

      if (!ref) {
        setError('No payment reference found in callback request.');
        setLoading(false);
        return;
      }

      setReference(ref);

      try {
        setLoading(true);
        const res = await api.payments.verify(ref);
        if (res?.success) {
          setSuccess(true);
          setPaymentData(res.data);
        } else {
          setError(res?.message || 'Payment verification could not be completed.');
        }
      } catch (err) {
        console.error('Callback verification error:', err);
        setError(err.message || 'Payment verification failed. Please contact support@mvplaunch.ng.');
      } finally {
        setLoading(false);
      }
    }

    verifyCheckout();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3.5vw, 2rem)',
          textAlign: 'center'
        }}
      >
        {/* State 1: Verifying */}
        {loading && (
          <div>
            <RefreshCw size={44} className="animate-float" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem' }}>
              Verifying Payment...
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Connecting with Paystack secure servers to confirm your transaction status. Please do not close this window.
            </p>
            {reference && (
              <code style={{
                background: 'var(--bg-surface)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'inline-block',
                marginTop: '1rem'
              }}>
                Ref: {reference}
              </code>
            )}
          </div>
        )}

        {/* State 2: Verified Success */}
        {!loading && success && (
          <div>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid var(--accent-emerald)'
            }}>
              <CheckCircle2 size={42} color="var(--accent-emerald)" />
            </div>

            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
              Payment Confirmed & Verified
            </span>

            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>
              Welcome to MVPLaunch NG!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Your order has been recorded in our production system and verified by Paystack.
            </p>

            {/* Receipt Summary Card */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Package</span>
                <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                  {paymentData?.package?.name || paymentData?.order?.package_name || 'Launch Package'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Amount Paid</span>
                <strong style={{ color: 'var(--accent-emerald-light)', fontSize: '1.05rem', fontWeight: 800 }}>
                  ₦{(paymentData?.payment?.amount_ngn || 0).toLocaleString()} NGN
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Customer Email</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.84rem', wordBreak: 'break-all' }}>
                  {paymentData?.order?.customer_email || paymentData?.payment?.customer_email}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Payment Reference</span>
                <span style={{ color: '#38bdf8', fontSize: '0.78rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {reference}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Delivery Timeline</span>
                <span style={{ color: '#e2e8f0', fontSize: '0.84rem' }}>
                  {paymentData?.package?.timeline || '3–7 Business Days'}
                </span>
              </div>
            </div>

            {/* Next Steps Onboarding Guidance */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.75rem',
              fontSize: '0.84rem',
              color: '#cbd5e1',
              lineHeight: '1.5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontWeight: 700, marginBottom: '0.35rem' }}>
                <Clock size={16} color="var(--accent-emerald)" />
                <span>What Happens Next:</span>
              </div>
              <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
                <li>Our lead engineer will review your notes and reach out within <strong>24 hours</strong>.</li>
                <li>You'll be invited to submit any project assets, texts, or profile information.</li>
                <li>We build, deploy to staging, and walk you through prototype handover!</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={onBackToHome}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700, justifyContent: 'center' }}
              >
                <Home size={18} />
                <span>Return to Homepage</span>
              </button>

              <a
                href="mailto:support@mvplaunch.ng"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', justifyContent: 'center' }}
              >
                <Mail size={16} />
                <span>Contact Engineering Support (support@mvplaunch.ng)</span>
              </a>
            </div>
          </div>
        )}

        {/* State 3: Cancelled / Abandoned */}
        {!loading && cancelled && (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid #f59e0b'
            }}>
              <AlertCircle size={36} color="#f59e0b" />
            </div>

            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
              Payment Cancelled or Incomplete
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Your checkout session was interrupted before payment was completed. Your card has not been charged.
            </p>

            <button
              onClick={onBackToHome}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
            >
              <span>Choose a Package to Try Again</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* State 4: Error */}
        {!loading && !success && !cancelled && (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid #ef4444'
            }}>
              <AlertCircle size={36} color="#ef4444" />
            </div>

            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
              Verification Notice
            </h3>

            <p style={{ color: '#f87171', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {error || 'Unable to confirm payment status at this time.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={onBackToHome}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Return to Homepage</span>
              </button>

              <a
                href="mailto:support@mvplaunch.ng"
                className="btn btn-ghost"
                style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
              >
                <span>Have a question? Email support@mvplaunch.ng</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
