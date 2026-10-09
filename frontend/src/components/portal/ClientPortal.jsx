import React, { useState, useEffect } from 'react';
import {
  Rocket, CheckCircle2, Clock, CreditCard, Send, Cloud,
  Star, ShieldCheck, ArrowRight, MessageSquare,
  FileText, Plus, AlertCircle, RefreshCw, Layers, ExternalLink,
  Code, Download, Sparkles, Check
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STAGE_STEPS = [
  { key: 'PAYMENT_VERIFIED', label: 'Payment Verified' },
  { key: 'SUBMITTED', label: 'Brief Submitted' },
  { key: 'ADMIN_SCOPING', label: 'Technical Scoping' },
  { key: 'ENGINEER_ASSIGNED', label: 'Engineer Assigned' },
  { key: 'IN_DEVELOPMENT', label: 'In Development' },
  { key: 'INTERNAL_REVIEW', label: 'QA Testing' },
  { key: 'DELIVERED', label: 'Delivered / Live' }
];

function getStageIndex(status) {
  switch (status) {
    case 'PAYMENT_VERIFIED':
    case 'AWAITING_PROJECT_SUBMISSION':
      return 0;
    case 'SUBMITTED':
      return 1;
    case 'ADMIN_SCOPING':
    case 'AWAITING_ENGINEER':
      return 2;
    case 'ENGINEER_ASSIGNED':
    case 'ACCEPTED':
      return 3;
    case 'IN_DEVELOPMENT':
    case 'REVISION_REQUIRED':
      return 4;
    case 'INTERNAL_REVIEW':
      return 5;
    case 'APPROVED':
    case 'DELIVERED':
    case 'COMPLETED':
      return 6;
    default:
      return 1;
  }
}

export default function ClientPortal({ onBackToLanding }) {
  const { user, logout, setIdeaModalOpen } = useAuth();
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'orders'

  const loadClientData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        api.projects.list().catch(() => ({ data: { projects: [] } })),
        api.orders.list().catch(() => ({ data: { orders: [] } }))
      ]);

      const projList = pRes?.data?.projects || pRes?.data || [];
      const ordList = Array.isArray(oRes?.data) ? oRes.data : (oRes?.data?.orders || oRes?.orders || []);

      setProjects(projList);
      setOrders(ordList);

      if (projList.length > 0) {
        setSelectedProject(projList[0]);
      }
    } catch (err) {
      console.error('Error loading client data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, []);

  const unsubmittedOrders = orders.filter(o => o.payment_status === 'PAID' && !o.project_submitted);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.85rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={onBackToLanding} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              ← Return Home
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
              }}>
                <Rocket size={18} color="#032014" strokeWidth={2.5} />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Client MVP Workspace
                </strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Active Nigerian Builds • Real-time Delivery Tracker
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIdeaModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={14} />
              <span>Submit New MVP Brief</span>
            </button>

            <button onClick={loadClientData} className="btn btn-secondary btn-sm" disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.5rem 0'
      }}>
        <div className="container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('projects')}
            className={`btn btn-sm ${activeTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <Rocket size={15} />
            <span>My Projects & Delivery</span>
            <span style={{
              background: activeTab === 'projects' ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.72rem'
            }}>
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <CreditCard size={15} />
            <span>Orders & Receipts</span>
            <span style={{
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.72rem'
            }}>
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        {/* Banner if user has verified paid order awaiting project brief */}
        {unsubmittedOrders.length > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} color="var(--accent-emerald)" />
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>
                  You have a verified paid package ready for submission!
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  {unsubmittedOrders[0].package_name} (₦{unsubmittedOrders[0].total_amount_ngn?.toLocaleString()}) — Complete your project brief so engineering can begin immediately.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIdeaModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <span>Submit Project Brief Now</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* TAB 1: PROJECTS & DELIVERY TRACKING */}
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '4rem 2rem',
                textAlign: 'center',
                maxWidth: '560px',
                margin: '2rem auto'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <Rocket size={32} color="var(--accent-emerald)" />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                  No Active Projects Yet
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Select an affordable launch package, complete secure Paystack checkout, and submit your project brief to start development.
                </p>
                <button
                  onClick={() => setIdeaModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.75rem', fontWeight: 700 }}
                >
                  <span>Start Your MVP Project</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Project Selector List */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    My MVP Projects
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {projects.map(proj => {
                      const isSelected = selectedProject?.id === proj.id;
                      return (
                        <button
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          style={{
                            textAlign: 'left',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                            border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid rgba(255,255,255,0.06)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                              {proj.project_code || 'PRJ-RECORD'}
                            </span>
                            <span className={`badge ${
                              proj.status === 'COMPLETED' || proj.status === 'DELIVERED' ? 'badge-emerald' : 'badge-blue'
                            }`} style={{ fontSize: '0.65rem' }}>
                              {proj.status}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {proj.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {proj.industry}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Project Full Tracker */}
                {selectedProject && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Live Delivery Banner if Delivered */}
                    {(selectedProject.status === 'DELIVERED' || selectedProject.status === 'COMPLETED' || selectedProject.production_url) && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                        border: '2px solid var(--accent-emerald)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--accent-emerald)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#032014'
                          }}>
                            <CheckCircle2 size={28} />
                          </div>
                          <div>
                            <span className="badge badge-emerald" style={{ marginBottom: '0.25rem' }}>
                              Project Successfully Delivered!
                            </span>
                            <h3 style={{ fontSize: '1.35rem', color: '#fff', margin: 0 }}>
                              Your MVP is Live & Ready
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                              All core features have been developed, QA tested, and deployed to production cloud hosting.
                            </p>
                          </div>
                        </div>

                        {selectedProject.production_url && (
                          <a
                            href={selectedProject.production_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.5rem', fontWeight: 800, background: 'var(--accent-emerald)', color: '#032014' }}
                          >
                            <ExternalLink size={16} />
                            <span>Open Live Application</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Project Overview Card */}
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem' }}>
                              {selectedProject.project_code || 'PRJ-RECORD'}
                            </span>
                            <span className="badge badge-emerald">
                              {selectedProject.selected_package_name || selectedProject.order_package_name || 'Launch Package'}
                            </span>
                            <span className="badge badge-indigo">{selectedProject.industry}</span>
                          </div>
                          <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>
                            {selectedProject.title}
                          </h2>
                        </div>

                        <span className={`badge ${
                          selectedProject.status === 'COMPLETED' || selectedProject.status === 'DELIVERED' ? 'badge-emerald' : 'badge-blue'
                        }`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                          {selectedProject.status}
                        </span>
                      </div>

                      {/* 7-Stage Visual Lifecycle Progress Tracker */}
                      <div style={{ margin: '1.5rem 0' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
                          Project Delivery Stage
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGE_STEPS.length}, 1fr)`, gap: '4px' }}>
                          {STAGE_STEPS.map((step, idx) => {
                            const currentIdx = getStageIndex(selectedProject.status);
                            const isDone = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div key={step.key} style={{ textAlign: 'center' }}>
                                <div style={{
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: isDone ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                                  marginBottom: '0.4rem',
                                  boxShadow: isCurrent ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                                }} />
                                <div style={{
                                  fontSize: '0.68rem',
                                  color: isDone ? '#fff' : 'var(--text-muted)',
                                  fontWeight: isCurrent ? 700 : 500,
                                  lineHeight: '1.2'
                                }}>
                                  {step.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Progress Percent Bar */}
                      {selectedProject.progress_percent > 0 && (
                        <div style={{ marginTop: '1rem', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                            <span>Engineering Completion</span>
                            <strong style={{ color: 'var(--accent-emerald-light)' }}>{selectedProject.progress_percent}%</strong>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${selectedProject.progress_percent}%`, height: '100%', background: 'var(--accent-emerald)' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deliverables Links (Production, Staging, Repository) */}
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem'
                    }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Cloud size={18} color="var(--accent-emerald)" />
                        <span>Deliverables & Deployment Access</span>
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        {selectedProject.production_url && (
                          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-light)', fontWeight: 700, marginBottom: '0.25rem' }}>
                              LIVE PRODUCTION APP
                            </div>
                            <a
                              href={selectedProject.production_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}
                            >
                              <span>{selectedProject.production_url}</span>
                              <ExternalLink size={14} color="var(--accent-emerald)" />
                            </a>
                          </div>
                        )}

                        {selectedProject.staging_url && (
                          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.25rem' }}>
                              STAGING PREVIEW
                            </div>
                            <a
                              href={selectedProject.staging_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}
                            >
                              <span>{selectedProject.staging_url}</span>
                              <ExternalLink size={14} color="#38bdf8" />
                            </a>
                          </div>
                        )}

                        {selectedProject.repo_url && (
                          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 700, marginBottom: '0.25rem' }}>
                              GITHUB CODE REPOSITORY
                            </div>
                            <a
                              href={selectedProject.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}
                            >
                              <span>{selectedProject.repo_url}</span>
                              <Code size={14} color="#818cf8" />
                            </a>
                          </div>
                        )}
                      </div>

                      {!selectedProject.production_url && !selectedProject.staging_url && !selectedProject.repo_url && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Deployment and repository URLs will appear here as soon as our Software Engineer completes the initial preview build.
                        </div>
                      )}
                    </div>

                    {/* Submitted Brief Summary */}
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem'
                    }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={18} color="var(--accent-emerald)" />
                        <span>Submitted Specifications</span>
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Problem Being Solved:</strong>
                          <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{selectedProject.problem_statement || selectedProject.description}</p>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Target Audience:</strong>
                          <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{selectedProject.target_users || '—'}</p>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Core MVP Features:</strong>
                          {Array.isArray(selectedProject.core_features) && selectedProject.core_features.length > 0 ? (
                            <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#e2e8f0' }}>
                              {selectedProject.core_features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          ) : (
                            <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{JSON.stringify(selectedProject.core_features) || '—'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS & RECEIPTS */}
        {activeTab === 'orders' && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Package</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payment Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Project Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No order records found.
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {o.id?.substring(0, 8)}...
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                        {o.package_name || 'Launch Package'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>
                        ₦{(o.total_amount_ngn || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${o.payment_status === 'PAID' ? 'badge-emerald' : 'badge-amber'}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {o.project_code || (o.project_submitted ? 'Submitted' : 'Pending Brief')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
