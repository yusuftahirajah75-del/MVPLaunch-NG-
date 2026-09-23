import React from 'react';
import { XCircle, CheckCircle, ArrowDown, Sparkles } from 'lucide-react';

export default function BeforeAfterSection() {
  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>The Transformation</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            What changes when you build with MVPLaunch NG?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            A side-by-side look at the typical chaotic freelance journey versus our structured Nigerian launch pathway.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {/* BEFORE CARD */}
          <div className="card" style={{
            background: 'rgba(244, 63, 94, 0.03)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)'
              }}>
                <XCircle size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#fda4af' }}>The Typical Unstructured Struggle</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f43f5e' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>Idea Phase</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vague concept on 40-slide presentation deck.</span>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><ArrowDown size={18} /></div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f43f5e' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>Scope Chaos</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Adding AI, crypto, chatbots and native apps all at once.</span>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><ArrowDown size={18} /></div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f43f5e' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>Execution Trap</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Freelancers missing calls, incomplete UI, no payments, half-baked backend.</span>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><ArrowDown size={18} /></div>

              <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.12)', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(244, 63, 94, 0.4)', textAlign: 'center' }}>
                <strong style={{ color: '#fda4af', fontSize: '0.95rem' }}>RESULT: 6 Months Lost & Nothing Live to Show</strong>
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="card" style={{
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: 'var(--shadow-glow)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald-light)'
              }}>
                <CheckCircle size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-emerald-light)' }}>The MVPLaunch NG Launch Pathway</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-emerald)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>Validated Nigerian Problem</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Clear target customer, defined value proposition & core metric.</span>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--accent-emerald)' }}><ArrowDown size={18} /></div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-emerald)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>Frozen 3-Week MVP Scope</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Strict must-have features only. Zero bloat. Transparent fixed quote.</span>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--accent-emerald)' }}><ArrowDown size={18} /></div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-emerald)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>Escrow-Backed Development</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily progress, visible tasks, Paystack milestone releases on your approval.</span>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--accent-emerald)' }}><ArrowDown size={18} /></div>

              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.4)', textAlign: 'center' }}>
                <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>RESULT: Live Web URL, GitHub Handover & Real Users Testing</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
