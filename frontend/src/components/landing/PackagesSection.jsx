import React, { useState } from 'react';
import {
  Check, X as XIcon, ArrowRight, Calculator, Sparkles, Clock, ShieldCheck,
  CreditCard, HelpCircle, AlertCircle, FileCheck, PhoneCall, Mail
} from 'lucide-react';
import PackageCheckoutModal from '../modals/PackageCheckoutModal';
import { useAuth } from '../../context/AuthContext';

export const LAUNCH_PACKAGES = [
  {
    id: 'student-starter',
    name: 'Student Starter',
    priceNgn: 5000,
    paymentType: 'One-time payment',
    badge: 'Nigerian Students',
    tagline: 'Personal portfolio or project showcase for students',
    deliverable: 'A personal portfolio website or simple project landing page.',
    timeline: '3–5 Business Days',
    ctaText: 'Get Started — ₦5,000',
    popular: false,
    features: [
      'Mobile-responsive design tailored for smartphones',
      'Projects & accomplishments showcase section',
      'Bio, skills overview & verified social profile links',
      'Direct contact or WhatsApp enquiry trigger',
      'Deployment assistance on free tier hosting (Vercel/Render)'
    ],
    exclusions: [
      'No user authentication or database accounts',
      'No custom backend API or payment integration',
      'No custom domain purchase included (domain cost extra)',
      'Single-page layout (up to 4 focused sections)'
    ]
  },
  {
    id: 'mvp-starter',
    name: 'MVP Starter',
    priceNgn: 15000,
    paymentType: 'One-time payment',
    badge: 'Aspiring Founders & Builders',
    tagline: 'Simple startup landing page or agreed MVP prototype',
    deliverable: 'A simple startup landing page or agreed MVP prototype.',
    timeline: '5–7 Business Days',
    ctaText: 'Launch Your MVP — ₦15,000',
    popular: true,
    features: [
      'Product introduction & unique value proposition block',
      'Lead-capture waitlist form or customer enquiry trigger',
      'Responsive interface optimized for Nigerian 3G/4G connections',
      'Feature preview sections & call-to-action blocks',
      'Basic staging and production deployment setup'
    ],
    exclusions: [
      'No complex multi-role backend or custom database clustering',
      'No e-commerce cart with automated inventory dispatch',
      'Third-party paid API subscription costs not included',
      'Single-page web prototype (up to 6 sections)'
    ]
  },
  {
    id: 'business-launch',
    name: 'Business Launch',
    priceNgn: 35000,
    paymentType: 'One-time payment',
    badge: 'Small Businesses in Nigeria',
    tagline: 'Basic business website with agreed service or product pages',
    deliverable: 'A basic business website with agreed service or product pages.',
    timeline: '7–10 Business Days',
    ctaText: 'Launch Your Business — ₦35,000',
    popular: false,
    features: [
      'Multi-section business website (Home, Services, About, Contact)',
      'Customer enquiry & quote request functionality',
      'Mobile-first responsive design tailored for local clients',
      'Basic SEO setup (meta tags, OpenGraph preview, title hierarchy)',
      'Deployment, basic DNS guidance, and full asset handover'
    ],
    exclusions: [
      'No automated monthly recurring billing or complex escrow engine',
      'Custom domain registration fee billed directly by domain registrar',
      'Client provides company text, logos, and product photos',
      'Up to 4 distinct views / agreed sections'
    ]
  }
];

export default function PackagesSection() {
  const { setIdeaModalOpen } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setCheckoutModalOpen(true);
  };

  // Interactive Scope Estimator State for custom builds
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
    <section id="services" style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Fixed One-Time Pricing</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem', color: '#fff' }}>
            Affordable Launch Packages for Nigeria.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Transparent, one-time payments in Nigerian naira (₦). Defined deliverables, zero hidden fees, and secure Paystack checkout.
          </p>
        </div>

        {/* 3 Main Package Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.75rem',
          marginBottom: '4rem'
        }}>
          {LAUNCH_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="card"
              style={{
                background: pkg.popular ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-card) 45%)' : 'var(--bg-card)',
                borderColor: pkg.popular ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                boxShadow: pkg.popular ? '0 12px 30px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-13px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent-emerald)',
                  color: '#032014',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  padding: '3px 14px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Most Popular For Builders
                </div>
              )}

              {/* Package Header */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', marginBottom: '0.5rem' }}>
                  {pkg.badge}
                </span>
                <h3 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '0.35rem' }}>{pkg.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', minHeight: '40px' }}>{pkg.tagline}</p>
              </div>

              {/* Price Banner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--accent-emerald-light)' }}>
                    ₦{pkg.priceNgn.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {pkg.paymentType}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#fff' }}>
                  <Clock size={15} color="var(--accent-emerald)" />
                  <span>{pkg.timeline}</span>
                </div>
              </div>

              {/* Exact Deliverable */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                borderLeft: '3px solid var(--accent-emerald)',
                padding: '0.65rem 0.85rem',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: '0.84rem',
                color: '#e2e8f0',
                marginBottom: '1.25rem',
                lineHeight: '1.4'
              }}>
                <strong>Deliverable:</strong> {pkg.deliverable}
              </div>

              {/* Included Features */}
              <div style={{ marginBottom: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Included In Scope:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, margin: 0 }}>
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.86rem', color: '#cbd5e1' }}>
                      <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explicit Exclusions */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#f87171', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Scope Exclusions:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: 0, margin: 0 }}>
                  {pkg.exclusions.map((excl, eIdx) => (
                    <li key={eIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <XIcon size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{excl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Paystack CTA Button */}
              <button
                id={`buy-${pkg.id}`}
                onClick={() => handleSelectPackage(pkg)}
                className={`btn ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <CreditCard size={17} />
                <span>{pkg.ctaText}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Transparent Service Terms & Delivery Process Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
          marginBottom: '3.5rem'
        }}>
          <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <FileCheck size={20} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>Delivery & Revision Process</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              After checkout, our team reaches out within 24 hours. You submit project text, logos, and links. Each package includes 2 to 3 rounds of revisions within 7–14 days of prototype delivery.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <ShieldCheck size={20} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>Domain & Third-Party Fees</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Packages cover complete design and engineering deliverables. Custom domains (.ng / .com) and paid third-party hosting are billed directly by registrars at cost.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <Mail size={20} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>Support & Refund Policy</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Orders are 100% refundable before development begins. Reach our verified support team anytime via <strong style={{ color: '#fff' }}>support@mvplaunch.ng</strong> or our dedicated WhatsApp desk.
            </p>
          </div>
        </div>

        {/* Interactive Scope & Custom MVP Estimator */}
        <div className="glass-panel" style={{
          padding: 'clamp(1.25rem, 4vw, 2.5rem)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Calculator size={22} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Need A Larger Custom MVP Architecture?</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            If your startup requires full relational databases, automated Paystack payment escrows, multi-role user authentication, or mobile PWA features, use our custom scope estimator below:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Custom Estimate Range</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                ₦{totalEstimatedCost.toLocaleString()} – ₦{(totalEstimatedCost * 1.3).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setIdeaModalOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.5rem' }}
            >
              <span>Submit Custom MVP Inquiry</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Package Checkout Modal */}
      <PackageCheckoutModal
        packageData={selectedPackage}
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
      />
    </section>
  );
}
