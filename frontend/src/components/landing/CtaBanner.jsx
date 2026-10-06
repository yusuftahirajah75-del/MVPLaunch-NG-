import React from 'react';
import { ArrowRight, MessageSquare, Rocket, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CtaBanner() {
  const { setIdeaModalOpen } = useAuth();

  return (
    <section style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div className="glass-panel" style={{
          padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(6, 9, 17, 0.9) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: 'var(--shadow-glow)',
          position: 'relative'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-emerald)',
            color: '#032014',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Rocket size={26} strokeWidth={2.5} />
          </div>

          <span className="badge badge-emerald" style={{ marginBottom: '1rem' }}>No Commitment Required</span>
          
          <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', maxWidth: '780px', margin: '0 auto 1.25rem' }}>
            Your next step doesn’t have to be complicated.
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.15rem',
            maxWidth: '640px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            Tell us what problem you’re trying to solve. We’ll help turn your idea into a practical MVP plan with clear milestones and fixed pricing.
          </p>

          <div className="mobile-stack-buttons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIdeaModalOpen(true)}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '220px' }}
            >
              <span>Start My MVP</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setIdeaModalOpen(true)}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: '200px', gap: '0.5rem' }}
            >
              <MessageSquare size={18} color="var(--accent-emerald-light)" />
              <span>Talk About My Idea</span>
            </button>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Free technical scoping review • Guaranteed 24-hour turnaround • 100% Confidential
          </div>
        </div>
      </div>
    </section>
  );
}
