import React, { useState } from 'react';
import { Search, UserCheck, Compass, Hammer, CloudUpload, KeyRound, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STEPS = [
  {
    num: '01',
    title: 'Clarify Problem',
    icon: Search,
    color: '#38bdf8',
    summary: 'Deconstruct your idea into the core bottleneck it solves in Nigeria.',
    details: 'We identify existing painful workarounds (e.g. manual bank transfers, messy WhatsApp spreadsheets) and pinpoint why your software creates immediate value.'
  },
  {
    num: '02',
    title: 'Define Customer',
    icon: UserCheck,
    color: '#34d399',
    summary: 'Determine who feels the pain most urgently and how to reach them.',
    details: 'Whether it is campus students in Akoka or traders in Computer Village, we define the primary user archetype and customer acquisition channel.'
  },
  {
    num: '03',
    title: 'Freeze MVP Scope',
    icon: Compass,
    color: '#a78bfa',
    summary: 'Lock in only the indispensable features needed for version 1.',
    details: 'We eliminate distractions and define a crystal-clear feature checklist with a fixed delivery timeline and milestone breakdown.'
  },
  {
    num: '04',
    title: 'Build Architecture',
    icon: Hammer,
    color: '#f59e0b',
    summary: 'Code the PostgreSQL database, Express API, and modern React interface.',
    details: 'Production-ready code with Paystack integration, authentication, and error handling. You track daily progress via our live task dashboard.'
  },
  {
    num: '05',
    title: 'Deploy Live',
    icon: CloudUpload,
    color: '#06b6d4',
    summary: 'Launch the application on cloud infrastructure with custom domain & SSL.',
    details: 'Fast, secure hosting on Render with automatic SSL certificates, environment variables, and fast Nigeria CDN edge delivery.'
  },
  {
    num: '06',
    title: 'GitHub Handover',
    icon: KeyRound,
    color: '#ec4899',
    summary: 'Complete transfer of the source code repository, credentials & guides.',
    details: 'You retain 100% intellectual property ownership. The repository is pushed to your GitHub account with thorough setup documentation.'
  },
  {
    num: '07',
    title: 'User Validation',
    icon: UserPlus,
    color: '#10b981',
    summary: 'Put the product in front of 5–10 real users and measure traction.',
    details: 'Gather structured user feedback, monitor payment transactions, and calculate your pilot Net Promoter Score to prepare for fundraising or scaling.'
  }
];

export default function WorkflowSection() {
  const [selectedStep, setSelectedStep] = useState(0);
  const { setIdeaModalOpen } = useAuth();

  return (
    <section id="how-it-works" style={{ padding: '6rem 0', background: 'var(--bg-surface)', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Structured Process</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            From Idea to MVP. One Clear Path.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            No vague promises or endless delays. Every project follows our verified 7-stage launch framework designed for rapid execution and real-world validation.
          </p>
        </div>

        {/* 7-Step Interactive Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem'
        }}>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = selectedStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedStep(idx)}
                className="card card-interactive"
                style={{
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  borderColor: isSelected ? s.color : 'var(--border-subtle)',
                  boxShadow: isSelected ? `0 0 20px ${s.color}25` : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: `${s.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.color
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    {s.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: isSelected ? '#fff' : 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                  {s.summary}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                  {s.details}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setIdeaModalOpen(true)} className="btn btn-primary btn-lg">
            <span>Submit Your Idea to Get Started</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
