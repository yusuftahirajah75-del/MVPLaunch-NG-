import React, { useState } from 'react';
import { Check, ArrowRight, Calculator, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PACKAGES = [
  {
    name: 'Project Finish Sprint',
    tagline: 'Have a prototype that needs finishing?',
    duration: '1–2 Weeks',
    suitableFor: 'Students & Hackathon finalists with partial code needing deployment & polish',
    features: [
      'Audit existing frontend/backend code',
      'Fix authentication & PostgreSQL database bugs',
      'Paystack webhook setup & verification',
      'Live staging deployment on Render with SSL',
      'Ready for grant application / incubator demo'
    ],
    ctaText: 'Get Sprint Estimate →',
    popular: false
  },
  {
    name: 'Full MVP Build Sprint',
    tagline: 'Have an idea that needs to become real?',
    duration: '3–4 Weeks',
    suitableFor: 'Founders & aspiring builders turning validated concepts into working MVPs',
    features: [
      'Problem clarification & MVP scope freezing',
      'PostgreSQL normalized database architecture',
      'Modern, mobile-responsive React web application',
      'Complete Paystack checkout (Cards, USSD, Bank Transfers)',
      'Live deployment + full GitHub repository handover',
      '14 days post-handover bug warranty & support'
    ],
    ctaText: 'Start Your MVP Build →',
    popular: true
  },
  {
    name: 'Maintenance & Growth Retainer',
    tagline: 'Already launched your MVP?',
    duration: 'Monthly Ongoing',
    suitableFor: 'Businesses needing continuous engineering support after going live',
    features: [
      'Dedicated monthly engineering support hours',
      'Performance monitoring & security patch updates',
      'Feature adjustments based on real user feedback',
      'PostgreSQL automated backups & database tuning',
      'Priority direct developer communication channel'
    ],
    ctaText: 'Inquire About Retainers →',
    popular: false
  }
];

export default function PackagesSection() {
  const { setIdeaModalOpen } = useAuth();

  // Interactive Scope Estimator State
  const [selectedFeatures, setSelectedFeatures] = useState({
    auth: true,
    paystack: true,
    responsiveUI: true,
    fileUploads: false,
    whatsappBridge: true,
    adminDashboard: false
  });

  const toggleFeature = (key) => {
    setSelectedFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic estimate calculation
  const featureList = [
    { key: 'auth', name: 'User Authentication & Sessions (JWT + Cookie)', weeks: 0.5, cost: 80000 },
    { key: 'paystack', name: 'Paystack Automated Checkout & Webhooks', weeks: 0.5, cost: 100000 },
    { key: 'responsiveUI', name: 'Mobile-First Responsive React Storefront/App', weeks: 1.0, cost: 200000 },
    { key: 'fileUploads', name: 'Document/Image File Upload Storage', weeks: 0.5, cost: 70000 },
    { key: 'whatsappBridge', name: 'WhatsApp Order Dispatch Generator', weeks: 0.5, cost: 80000 },
    { key: 'adminDashboard', name: 'Merchant / Admin Analytics Dashboard', weeks: 0.8, cost: 150000 }
  ];

  const totalWeeks = Math.max(2, Math.round(featureList.reduce((acc, f) => (selectedFeatures[f.key] ? acc + f.weeks : acc), 0.5)));
  const totalEstimatedCost = featureList.reduce((acc, f) => (selectedFeatures[f.key] ? acc + f.cost : acc), 100000);

  return (
    <section id="services" style={{ padding: '6rem 0', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Service Pathways</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            Predictable Pathways to Launch.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            We work on fixed, transparent milestone commitments. Every proposal details exact deliverables, timelines in weeks, and escrow payments tied to your sign-off.
          </p>
        </div>

        {/* 3 Package Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4.5rem'
        }}>
          {PACKAGES.map((pkg, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                background: pkg.popular ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 40%)' : 'var(--bg-card)',
                borderColor: pkg.popular ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                boxShadow: pkg.popular ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent-emerald)',
                  color: '#032014',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Most Popular For Builders
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.35rem' }}>{pkg.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{pkg.tagline}</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <Clock size={16} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Timeline: {pkg.duration}</span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Ideal for: {pkg.suitableFor}
              </div>

              {/* Feature Checklist */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem', flex: 1 }}>
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
                    <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setIdeaModalOpen(true)}
                className={`btn ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                <span>{pkg.ctaText}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Interactive Scope & Timeline Estimator */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Calculator size={22} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Interactive Project Scope & Timeline Estimator</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Select the components your MVP needs to get a realistic development timeline estimate:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
            {featureList.map((f) => (
              <label
                key={f.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: selectedFeatures[f.key] ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${selectedFeatures[f.key] ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFeatures[f.key]}
                  onChange={() => toggleFeature(f.key)}
                  style={{ accentColor: 'var(--accent-emerald)', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: selectedFeatures[f.key] ? '#fff' : 'var(--text-secondary)' }}>
                  {f.name}
                </span>
              </label>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            padding: '1.25rem 1.75rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Sprint Time</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
                {totalWeeks} to {totalWeeks + 1} Weeks
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Investment Range</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                ₦{totalEstimatedCost.toLocaleString()} – ₦{(totalEstimatedCost * 1.3).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setIdeaModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.5rem' }}
            >
              <span>Get Precise Project Proposal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
