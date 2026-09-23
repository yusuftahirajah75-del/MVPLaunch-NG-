import React, { useState } from 'react';
import { Lightbulb, Target, Code, Globe, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const STAGES = [
  {
    id: 'idea',
    step: '01',
    label: 'Idea',
    icon: Lightbulb,
    badge: 'Raw Concept',
    title: 'The Validated Nigerian Problem',
    tagline: 'Moving beyond slide decks and voice notes into concrete business logic.',
    card: {
      client: 'Chioma (Founder, Lagos)',
      target: 'Alaba & Computer Village Traders',
      prompt: '“Traders lose 40% of sales answering repetitive WhatsApp DMs and waiting for manual bank alerts. We need a 30-second mobile storefront with instant Paystack checkout and automated order alerts.”',
      status: 'Problem Clarified & Approved'
    }
  },
  {
    id: 'scope',
    step: '02',
    label: 'Scope',
    icon: Target,
    badge: 'Scope Frozen',
    title: 'Filtering the Core from Distractions',
    tagline: 'We strip away 6 months of fluff to launch the smallest high-utility version in 3 weeks.',
    card: {
      mustHaves: [
        'Mobile-first catalog with Naira (₦) pricing',
        'Direct Paystack checkout (Cards, USSD, Bank Transfer)',
        'Merchant inventory editor',
        'Instant WhatsApp pre-filled order dispatch'
      ],
      outOfScope: ['Native mobile app (PWA first)', 'Multi-currency conversion', 'Autonomous delivery drone routing'],
      timeline: '21 Days Delivery Target'
    }
  },
  {
    id: 'build',
    step: '03',
    label: 'Build',
    icon: Code,
    badge: 'In Development',
    title: 'Production-Grade Modular Architecture',
    tagline: 'No bloated CMS, no messy spaghetti code. Clean PostgreSQL, Node.js & React built to scale.',
    card: {
      stack: ['Node.js', 'Express', 'PostgreSQL 15', 'React 18', 'Paystack API'],
      milestones: [
        { name: 'Schema & Paystack Webhooks', status: 'Completed (Approved)', progress: 100 },
        { name: 'Merchant UI & Cart', status: 'In Progress', progress: 65 },
        { name: 'Render Deploy & Handover', status: 'Pending', progress: 0 }
      ]
    }
  },
  {
    id: 'deploy',
    step: '04',
    label: 'Deploy',
    icon: Globe,
    badge: 'Live Preview',
    title: 'Accessible Online with SSL',
    tagline: 'A real URL you can send to customers, competitions, incubators, or mentors.',
    card: {
      url: 'https://staging-quickretail.mvplaunch.ng',
      environment: 'Staging (Render.com + PostgreSQL)',
      ssl: 'Active TLS 1.3 Encryption',
      latency: '34ms Lagos CDN Response'
    }
  },
  {
    id: 'validate',
    step: '05',
    label: 'Validate',
    icon: CheckCircle2,
    badge: 'Market Validated',
    title: 'Real Feedback from Paying Customers',
    tagline: 'Your MVP generates proof, customer transactions, and genuine traction.',
    card: {
      testers: '5 Lagos Retail Merchants',
      metric: '₦125,000 processed in pilot test',
      nps: '9 / 10 Net Promoter Score',
      handover: 'Full GitHub Repo & Credentials Transferred to Client'
    }
  }
];

export default function TransformationPipeline() {
  const [activeStage, setActiveStage] = useState('idea');
  const current = STAGES.find((s) => s.id === activeStage);

  return (
    <div className="glass-panel" style={{
      padding: '2rem',
      borderRadius: 'var(--radius-xl)',
      marginTop: '2.5rem',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.12)'
    }}>
      {/* Background Accent Mesh */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Stage Selector Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interactive MVP Transformation Engine
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Click any step to see how ideas evolve into code:
        </div>
      </div>

      {/* Stepper Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.65rem',
        margin: '1.25rem 0 1.75rem'
      }}>
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === activeStage;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-card-hover)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isActive ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                transition: 'all var(--transition-fast)',
                textAlign: 'left'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isActive ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.06)',
                color: isActive ? '#032014' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0
              }}>
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP {s.step}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? '#fff' : 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Content Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>{current.badge}</span>
            <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>{current.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{current.tagline}</p>
          </div>
        </div>

        {/* Dynamic Card Display */}
        {current.id === 'idea' && (
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Client: <strong style={{ color: 'var(--text-primary)' }}>{current.card.client}</strong></span>
              <span>Target: <strong style={{ color: 'var(--text-primary)' }}>{current.card.target}</strong></span>
            </div>
            <p style={{ fontStyle: 'italic', color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {current.card.prompt}
            </p>
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald-light)', fontSize: '0.8rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>{current.card.status}</span>
            </div>
          </div>
        )}

        {current.id === 'scope' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Must-Have Features (Week 1–3)
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {current.card.mustHaves.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={14} color="var(--accent-emerald)" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fda4af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Protected Out-Of-Scope (Avoid Fluff)
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {current.card.outOfScope.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>✕</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {current.id === 'build' && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {current.card.stack.map((t, i) => (
                <span key={i} className="badge badge-indigo">{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {current.card.milestones.map((m, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: m.progress === 100 ? 'var(--accent-emerald-light)' : 'var(--accent-amber)' }}>{m.status}</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.progress}%`, background: m.progress === 100 ? 'var(--accent-emerald)' : 'var(--accent-amber)', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {current.id === 'deploy' && (
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
                <code style={{ fontSize: '0.95rem', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>{current.card.url}</code>
              </div>
              <span className="badge badge-emerald">Online</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Platform: <strong style={{ color: '#fff' }}>{current.card.environment}</strong></div>
              <div>Security: <strong style={{ color: '#fff' }}>{current.card.ssl}</strong></div>
              <div>Speed: <strong style={{ color: '#fff' }}>{current.card.latency}</strong></div>
            </div>
          </div>
        )}

        {current.id === 'validate' && (
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Testers Onboarded</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{current.card.testers}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transactions Verified</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>{current.card.metric}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Founder Recommendation</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fcd34d' }}>{current.card.nps}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="var(--accent-emerald)" />
              <span>{current.card.handover}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
