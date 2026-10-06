import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, Cloud, FileText, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { GithubIcon } from '../common/Icons';

const TABS = [
  { id: 'milestones', label: 'Milestones & Escrow', icon: CheckCircle2 },
  { id: 'tasks', label: 'Daily Task Board', icon: CheckSquare },
  { id: 'deployments', label: 'Live Deployment', icon: Cloud },
  { id: 'handover', label: 'GitHub Handover', icon: GithubIcon }
];

export default function WorkspacePreview() {
  const [activeTab, setActiveTab] = useState('milestones');

  return (
    <section style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-surface)', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>Client Experience</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            What you see inside your MVP workspace.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Never wonder what your engineer is doing. Our platform gives you real-time visibility into milestone approvals, task commits, staging URLs, and GitHub handover sign-offs.
          </p>
        </div>

        {/* Interactive Workspace Window */}
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Workspace Window Header */}
          <div style={{
            background: 'var(--bg-card)',
            padding: 'clamp(0.75rem, 2.5vw, 1rem) clamp(0.85rem, 3vw, 1.5rem)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                QuickRetail NG — Project Workspace
              </div>
              <span className="badge badge-emerald">IN_DEVELOPMENT</span>
            </div>

            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: isActive ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#032014' : 'var(--text-secondary)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workspace Body */}
          <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', background: 'var(--bg-base)' }}>
            {activeTab === 'milestones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Total Project Scope: <strong>₦750,000</strong> (3 Milestone Escrow Slices)
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>
                    Milestone 1 Completed & Verified
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-emerald">Phase 1</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>Database Schemas & Paystack Webhook Engine</strong>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--accent-emerald-light)' }}>₦250,000 (PAID)</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    PostgreSQL connection pool, client authentication, and secure HMAC webhook verification for Naira card/bank alerts.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-emerald-light)' }}>
                    <CheckCircle2 size={16} />
                    <span>Approved by Chioma Adeleke (Client Sign-Off)</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-amber">Phase 2</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>Merchant Inventory Dashboard & Customer Cart</strong>
                    </div>
                    <span style={{ fontWeight: 800, color: '#fcd34d' }}>₦250,000 (IN_PROGRESS)</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Mobile storefront UI, catalog editing, and WhatsApp direct checkout links. Current completion: 65%.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-outline">Phase 3</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>Production Launch & GitHub Transfer</strong>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>₦250,000 (PENDING)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-emerald-light)', marginBottom: '0.75rem' }}>
                    DONE (2)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Setup PostgreSQL schema & database pooling</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Milestone 1 • Assigned: Adebayo (Senior Dev)</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Implement Paystack webhook signature verification</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Milestone 1 • Assigned: Adebayo (Senior Dev)</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#fcd34d', marginBottom: '0.75rem' }}>
                    IN PROGRESS (1)
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Build Merchant Product Upload UI</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Milestone 2 • Assigned: Adebayo (Senior Dev)</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    TODO (1)
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Implement WhatsApp order link generator</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Milestone 2 • High Priority</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deployments' && (
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ minWidth: 0, maxWidth: '100%' }}>
                    <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>STAGING LIVE</span>
                    <h4 style={{ fontSize: '1.1rem', color: '#fff', wordBreak: 'break-all' }}>https://staging-quickretail.mvplaunch.ng</h4>
                  </div>
                  <a
                    href="https://staging-quickretail.mvplaunch.ng"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem' }}
                  >
                    <span>Visit Preview</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div>Git Commit: <code style={{ color: 'var(--accent-emerald-light)' }}>9f81a7b (feat: cart flow)</code></div>
                  <div>Server Region: <strong style={{ color: '#fff' }}>Frankfurt Edge (EU)</strong></div>
                  <div>Database: <strong style={{ color: '#fff' }}>PostgreSQL 15 (Active)</strong></div>
                </div>
              </div>
            )}

            {activeTab === 'handover' && (
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <GithubIcon size={24} color="#fff" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#fff', wordBreak: 'break-all' }}>github.com/mvplaunch-ng/quickretail-mvp</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Intellectual Property Transfer</p>
                    </div>
                  </div>
                  <span className="badge badge-indigo">PREPARING HANDOVER</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span>Complete source code repo with zero proprietary lock-in</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span>Environment variables template (.env.example) and database migrations</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span>Deployment guide for Render and Vercel hosting</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
