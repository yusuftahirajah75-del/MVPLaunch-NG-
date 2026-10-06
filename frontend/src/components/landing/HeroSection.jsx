import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Code2, Users, Rocket } from 'lucide-react';
import TransformationPipeline from './TransformationPipeline';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { setIdeaModalOpen } = useAuth();

  return (
    <section style={{ position: 'relative', paddingTop: 'clamp(2.5rem, 5vw, 4rem)', paddingBottom: 'clamp(3rem, 6vw, 5rem)', overflow: 'hidden' }}>
      <div className="bg-mesh" />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Positioning Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span className="badge badge-emerald" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            For Nigerian Students, Aspiring Founders & Small Businesses
          </span>
        </div>

        {/* Hero Headline */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          maxWidth: '960px',
          margin: '0 auto 1.25rem',
          lineHeight: 1.15
        }}>
          Your Idea Deserves to Become <br />
          <span style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Something Real.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.6
        }}>
          We turn validated ideas into working, deployable web MVPs—so you can stop explaining your concept on slides and start showing real working software to customers, mentors, and grant panels.
        </p>

        {/* CTAs */}
        <div className="mobile-stack-buttons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIdeaModalOpen(true)}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '220px' }}
          >
            <span>Start My MVP</span>
            <ArrowRight size={18} />
          </button>
          <a
            href="#how-it-works"
            className="btn btn-secondary btn-lg"
            style={{ minWidth: '180px' }}
          >
            See How It Works
          </a>
        </div>

        {/* Real Trust Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1.75rem',
          marginTop: '2.5rem',
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>100% GitHub Code Ownership</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>Milestone-Based Escrow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Rocket size={16} color="var(--accent-indigo)" />
            <span>Deployed Live in 2–4 Weeks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="#f59e0b" />
            <span>Paystack Card & USSD Ready</span>
          </div>
        </div>

        {/* Interactive Pipeline Transformation Graphic */}
        <TransformationPipeline />
      </div>
    </section>
  );
}
