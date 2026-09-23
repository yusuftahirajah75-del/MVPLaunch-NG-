import React from 'react';
import { HelpCircle, AlertTriangle, Clock, Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAIN_POINTS = [
  {
    icon: HelpCircle,
    color: '#38bdf8',
    title: '“I have an idea, but I don’t know where to start.”',
    description: 'You’ve spent weeks typing notes and sketching screens on paper, but you don’t have a clear technical roadmap to turn it into executable software.'
  },
  {
    icon: AlertTriangle,
    color: '#f59e0b',
    title: '“I need a developer but don’t know who to trust.”',
    description: 'Freelance horror stories are everywhere in Nigeria—unresponsive engineers, blown deadlines, half-baked code, or developers who disappear after collecting deposits.'
  },
  {
    icon: Layers,
    color: '#a78bfa',
    title: '“I don’t know what features my MVP actually needs.”',
    description: 'It’s easy to get trapped trying to build a giant 20-feature application before you even have a single customer or validator in your university or city.'
  },
  {
    icon: Clock,
    color: '#f43f5e',
    title: '“I need something to demonstrate for grants and competitions.”',
    description: 'Hackathons, angel investors, TEF grants, and incubators rarely fund slide decks anymore. They want to see a real working web link with actual database records.'
  }
];

export default function ProblemSection() {
  const { setIdeaModalOpen } = useAuth();

  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg-surface)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>The Builder’s Dilemma</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            Still saying <span style={{ color: '#f87171', textDecoration: 'underline wavy #f87171 2px' }}>“I have an idea”</span> instead of <span style={{ color: 'var(--accent-emerald-light)' }}>“Here is my product”</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            The hardest part of building a technology startup in Nigeria isn’t coming up with ideas—it’s moving from concept to a living, deployable web product without losing months of time.
          </p>
        </div>

        {/* 4 Pain Point Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {PAIN_POINTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="card card-interactive" style={{ background: 'var(--bg-card)' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `${p.color}15`,
                  border: `1px solid ${p.color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Icon size={22} color={p.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.65rem', color: '#fff' }}>{p.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Transition Callout Banner */}
        <div className="glass-panel" style={{
          padding: '2rem 2.5rem',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              The Clear Solution
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '0.2rem' }}>
              MVPLaunch NG removes the technical guesswork.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '620px' }}>
              We partner with you to clarify the problem, freeze the core requirements, build the full-stack architecture, integrate Paystack, and hand over your live code in weeks.
            </p>
          </div>
          <button
            onClick={() => setIdeaModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem' }}
          >
            <span>Let’s Build Your MVP</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
