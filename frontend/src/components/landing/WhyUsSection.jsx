import React from 'react';
import { Target, Users, Eye, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

const REASONS = [
  {
    icon: Target,
    color: '#38bdf8',
    title: 'We start with the problem.',
    description: 'We don’t let you burn your budget on 20 features before finding out if anybody in Nigeria actually cares. We zoom in on the core pain point first.'
  },
  {
    icon: Users,
    color: '#34d399',
    title: 'We build for real-world validation.',
    description: 'Your MVP is not an academic homework assignment. It is built with Paystack payments and user onboarding so you can test pricing and customer demand immediately.'
  },
  {
    icon: Eye,
    color: '#a78bfa',
    title: 'You see the journey.',
    description: 'No black-box mystery. You track every task, review staging URLs, and approve each milestone before escrow funds are released.'
  },
  {
    icon: CheckCircle2,
    color: '#f59e0b',
    title: 'You receive something usable.',
    description: 'Not static Figma mockups or half-working prototypes. We deliver a production-ready web application running live with SSL encryption.'
  },
  {
    icon: ShieldCheck,
    color: '#ec4899',
    title: 'You keep the project.',
    description: '100% intellectual property ownership. We hand over the complete GitHub repository, PostgreSQL database schemas, and API documentation.'
  },
  {
    icon: RefreshCw,
    color: '#06b6d4',
    title: 'You can continue after launch.',
    description: 'When users start using your product and you need rapid iterations or maintenance, our engineers stay available through flexible support retainers.'
  }
];

export default function WhyUsSection() {
  return (
    <section id="why-us" style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>The Distinction</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            Why build with MVPLaunch NG?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            We are not a bloated agency that charges ₦5,000,000 for slide presentations, nor are we unreliable freelance gigs that ghost you midway. We are your dedicated technical launch partner.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {REASONS.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div key={idx} className="card card-interactive" style={{ background: 'var(--bg-card)' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `${r.color}15`,
                  border: `1px solid ${r.color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: r.color,
                  marginBottom: '1.25rem'
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{r.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
