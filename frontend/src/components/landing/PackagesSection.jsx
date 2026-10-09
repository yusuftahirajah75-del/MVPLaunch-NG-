import React, { useState } from 'react';
import {
  Check, X as XIcon, ArrowRight, Calculator, Sparkles, Clock, ShieldCheck,
  CreditCard, HelpCircle, AlertCircle, FileCheck, PhoneCall, Mail,
  Target, AlertTriangle, Layers, Zap, CheckCircle2, MessageSquare
} from 'lucide-react';
import PackageCheckoutModal from '../modals/PackageCheckoutModal';
import { useAuth } from '../../context/AuthContext';

export const LAUNCH_PACKAGES = [
  {
    id: 'idea-validation',
    name: 'Idea Validation Starter',
    priceNgn: 15000,
    paymentType: 'One-time payment',
    badge: 'Idea Stage',
    badgeClass: 'badge-blue',
    tagline: 'Validate your concept before spending money writing code',
    idealCustomer: 'Anyone with an early idea who wants to confirm real demand before spending on software development.',
    problemSolved: 'Eliminates uncertainty, prevents wasted savings on building features nobody wants, and pinpoints your paying audience.',
    deliverable: 'A concrete 5-part Idea Validation Blueprint & action plan tailored to the Nigerian market.',
    timeline: '2–3 Business Days',
    ctaText: 'Validate My Idea — ₦15,000',
    popular: false,
    features: [
      'Problem clarification & core value proposition mapping',
      'Target customer persona (ICP) definition for Nigeria',
      'Local competitor analysis & differentiation breakdown',
      '10 structured customer interview questions for Nigerian users',
      'Step-by-step practical validation action plan'
    ],
    exclusions: [
      'Does not guarantee market demand, sales, or funding',
      'No custom coding, web design, or software prototypes',
      'No paid advertisement budgets or participant fees'
    ]
  },
  {
    id: 'student-project',
    name: 'Student Project Launch',
    priceNgn: 20000,
    paymentType: 'One-time payment',
    badge: 'Nigerian Students',
    badgeClass: 'badge-indigo',
    tagline: 'Professional project showcase or personal portfolio that stands out',
    idealCustomer: 'Nigerian students who need a clean, impressive portfolio or project showcase for defenses, job applications, or internship presentations.',
    problemSolved: 'Replaces unhosted code and messy screenshots with a live, responsive web portfolio that impresses supervisors and employers.',
    deliverable: 'A modern, responsive portfolio or project showcase website deployed live on free-tier cloud hosting.',
    timeline: '3–5 Business Days',
    ctaText: 'Launch Student Project — ₦20,000',
    popular: false,
    features: [
      'Modern, mobile-responsive single-page layout (up to 4 sections)',
      'Project showcase block with architecture & features highlights',
      'Bio, skills matrix, resume download & verified social links',
      'Direct WhatsApp or email contact trigger',
      'Live deployment on free cloud hosting (Vercel / Render)',
      'Clean GitHub repository handoff with setup instructions'
    ],
    exclusions: [
      'No academic ghostwriting, thesis preparation, or dishonest work',
      'No complex backend databases or user authentication systems',
      'Paid custom domains (.com / .ng) billed separately by registrar'
    ]
  },
  {
    id: 'founder-mvp',
    name: 'Founder MVP Launch',
    priceNgn: 35000,
    paymentType: 'One-time payment',
    badge: 'Most Popular for Founders',
    badgeClass: 'badge-emerald',
    tagline: 'High-converting MVP landing page with lead capture to test real traction',
    idealCustomer: 'Founders who need a live, persuasive product page to capture waitlist leads and test traction before spending millions on software.',
    problemSolved: 'Solves the "build in secret for months with 0 users" trap by giving you a live, credible launch presence in days.',
    deliverable: 'A focused, conversion-optimized MVP landing page with working waitlist / lead-capture form and live cloud deployment.',
    timeline: '5–7 Business Days',
    ctaText: 'Launch Founder MVP — ₦35,000',
    popular: true,
    features: [
      'High-converting MVP landing page (Hero, Problem, Features, FAQ, CTA)',
      'Lead-capture waitlist form connected to Google Sheets or database',
      'Mobile-first responsive design optimized for Nigerian data speeds',
      'Social share preview meta tags (OpenGraph & Twitter Card)',
      'Live production cloud deployment (Render / Vercel)',
      'Complete GitHub repository transfer & handover'
    ],
    exclusions: [
      'No complex multi-role backend SaaS engines or mobile apps',
      'Single-page web prototype (up to 6 core sections)',
      'Third-party paid API subscriptions or SMS gateway fees',
      'Custom domain registration fee billed directly by domain registrar'
    ]
  },
  {
    id: 'business-digital',
    name: 'Business Digital Launch',
    priceNgn: 50000,
    paymentType: 'One-time payment',
    badge: 'Small Business Growth',
    badgeClass: 'badge-amber',
    tagline: 'Professional multi-section business website with WhatsApp lead capture',
    idealCustomer: 'Small businesses and commercial service brands that need professional digital credibility and direct WhatsApp sales inquiries.',
    problemSolved: 'Ends online invisibility and lost sales by giving local customers a fast, credible business presence that routes inquiries straight to WhatsApp.',
    deliverable: 'A multi-section professional business website with service/product showcase, 1-click WhatsApp chat, and live deployment.',
    timeline: '7–10 Business Days',
    ctaText: 'Launch Business Site — ₦50,000',
    popular: false,
    features: [
      'Multi-section business website (Home, Services/Products, About, Contact)',
      'Services or products showcase catalog with photos, descriptions & pricing',
      '1-click WhatsApp contact integration with custom inquiry messages',
      'Google Maps location embed & direct phone call links',
      'Basic on-page SEO setup (meta tags, title hierarchy & search previews)',
      'Production deployment, DNS linking assistance, and full asset handover'
    ],
    exclusions: [
      'Full-scale multi-vendor e-commerce with automated warehousing',
      'Custom domain purchase (.com.ng / .ng) billed directly by registrar',
      'Client provides company logo, photos, and basic service descriptions',
      'Up to 4 distinct structured views/sections'
    ]
  }
];

export default function PackagesSection() {
  const { setIdeaModalOpen, setSelectedPackage: setContextSelectedPackage } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    if (setContextSelectedPackage) setContextSelectedPackage(pkg);
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

  const steps = [
    { num: '1', title: 'Choose Package', desc: 'Select the ₦15k–₦50k plan that fits your immediate need.' },
    { num: '2', title: 'Confirm Scope', desc: 'Agree on exact deliverables and timeline with zero hidden fees.' },
    { num: '3', title: 'Pay Securely', desc: 'Pay safely via Paystack (Debit Card, Bank Transfer, or USSD).' },
    { num: '4', title: 'Review Progress', desc: 'Get personal onboarding in 24h and review staging updates.' },
    { num: '5', title: 'Receive Deliverables', desc: 'Get live cloud deployment, code repository, or action plan.' }
  ];

  return (
    <section id="pricing" style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 2.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={13} />
            <span>Fixed One-Time Pricing • 100% Transparent</span>
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', marginBottom: '1rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Transparent Launch Packages for Nigeria
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
            Tailored specifically for Nigerian students, aspiring founders, and growing businesses.
            One-time payments in Naira (₦), concrete deliverables, and secure Paystack checkout with no hidden surprises.
          </p>
        </div>

        {/* Conversion-Focused "How It Works" Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.25rem, 3vw, 1.75rem)',
          marginBottom: '3.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-emerald)', fontWeight: 800 }}>
              Simple 5-Step Path to Launch
            </span>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0.25rem 0 0', fontWeight: 700 }}>
              How It Works
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
            gap: '1rem',
            position: 'relative'
          }}>
            {steps.map((st, i) => (
              <div
                key={st.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--accent-emerald)',
                    color: '#032014',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {st.num}
                  </div>
                  <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{st.title}</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Customer-Focused Package Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 265px), 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem',
          alignItems: 'stretch'
        }}>
          {LAUNCH_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="card"
              style={{
                background: pkg.popular
                  ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, var(--bg-card) 35%)'
                  : 'var(--bg-card)',
                borderColor: pkg.popular ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                boxShadow: pkg.popular ? '0 16px 36px rgba(16, 185, 129, 0.2)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                transform: pkg.popular ? 'translateY(-4px)' : 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  padding: '3px 14px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}>
                  ★ Most Popular For Founders
                </div>
              )}

              {/* Package Header */}
              <div style={{ marginBottom: '1rem' }}>
                <span className={`badge ${pkg.popular ? 'badge-emerald' : 'badge-emerald'}`} style={{ fontSize: '0.72rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                  {pkg.badge}
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.35rem', fontWeight: 800 }}>
                  {pkg.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', minHeight: '36px', lineHeight: '1.4', margin: 0 }}>
                  {pkg.tagline}
                </p>
              </div>

              {/* Price Banner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.15rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '1.95rem', fontWeight: 900, color: 'var(--accent-emerald-light)', lineHeight: '1' }}>
                    ₦{pkg.priceNgn.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {pkg.paymentType} • No Hidden Fees
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#fff' }}>
                  <Clock size={14} color="var(--accent-emerald)" />
                  <span>{pkg.timeline}</span>
                </div>
              </div>

              {/* Ideal Customer Box */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.18)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.8rem',
                marginBottom: '0.75rem',
                fontSize: '0.8rem',
                color: '#e2e8f0',
                lineHeight: '1.4'
              }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Target size={12} />
                  <span>Ideal Customer:</span>
                </div>
                {pkg.idealCustomer}
              </div>

              {/* Problem Solved Box */}
              <div style={{
                background: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.18)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.8rem',
                marginBottom: '0.85rem',
                fontSize: '0.8rem',
                color: '#e2e8f0',
                lineHeight: '1.4'
              }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={12} />
                  <span>Problem Solved:</span>
                </div>
                {pkg.problemSolved}
              </div>

              {/* Exact Deliverable */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.06)',
                borderLeft: '3px solid var(--accent-emerald)',
                padding: '0.65rem 0.8rem',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: '0.8rem',
                color: '#e2e8f0',
                marginBottom: '1.15rem',
                lineHeight: '1.4'
              }}>
                <strong style={{ color: 'var(--accent-emerald-light)' }}>Primary Deliverable:</strong> {pkg.deliverable}
              </div>

              {/* Included Features */}
              <div style={{ marginBottom: '1.15rem', flex: 1 }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Specific Deliverables Included:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0 }}>
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                      <Check size={15} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
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
                padding: '0.7rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#f87171', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                  Scope Exclusions:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: 0, margin: 0 }}>
                  {pkg.exclusions.map((excl, eIdx) => (
                    <li key={eIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.76rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      <XIcon size={13} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
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
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <CreditCard size={16} />
                <span>{pkg.ctaText}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Transparent Service Terms & Trust Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
          marginBottom: '3.5rem'
        }}>
          <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <FileCheck size={20} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 700 }}>Delivery & Revisions</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              After checkout, our team reaches out within 24 hours. You provide your idea brief, text, or photos. Every launch package includes 1 to 3 rounds of revisions within 7–14 days of delivery.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <ShieldCheck size={20} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 700 }}>Domains & Cloud Hosting</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              All packages include live deployment on reliable free cloud tiers (Vercel / Render). Custom domains (.com / .ng) are optional and billed directly by domain registrars at official cost.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <Mail size={20} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 700 }}>Support & Refund Policy</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Packages are 100% refundable before research or development kickoff. Payments are securely processed through Paystack. Contact our verified support desk anytime via <strong style={{ color: '#fff' }}>support@mvplaunch.ng</strong>.
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
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 700 }}>Need A Larger Custom MVP Architecture?</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            If your startup requires full relational databases, automated Paystack payment processing, multi-role user authentication, or custom dashboards beyond standard launch packages, estimate your scope below:
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
