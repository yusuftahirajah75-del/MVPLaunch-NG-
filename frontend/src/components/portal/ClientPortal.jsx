import React, { useState, useEffect } from 'react';
import {
  Rocket, CheckCircle2, Clock, CreditCard, Send, Cloud,
  Star, ShieldCheck, ArrowRight, MessageSquare,
  FileText, Plus, AlertCircle, RefreshCw, Layers, ExternalLink
} from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ClientPortal({ onBackToLanding }) {
  const { user, logout, setIdeaModalOpen } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [handover, setHandover] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | milestones | tasks | messages | handover | review
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  const loadClientData = async () => {
    setLoading(true);
    try {
      const res = await api.projects.list();
      const projList = res?.data || [];
      setProjects(projList);
      if (projList.length > 0) {
        const activeProj = projList[0];
        setSelectedProject(activeProj);
        await loadProjectDetails(activeProj.id);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      const [mRes, tRes, pRes, dRes, msgRes] = await Promise.all([
        api.milestones.getByProject(projectId).catch(() => ({ data: [] })),
        api.tasks.getByProject(projectId).catch(() => ({ data: [] })),
        api.proposals.getByProject(projectId).catch(() => ({ data: [] })),
        api.deployments.getByProject(projectId).catch(() => ({ data: [] })),
        api.messages.getByProject(projectId).catch(() => ({ data: [] }))
      ]);

      setMilestones(mRes?.data?.milestones || mRes?.data || []);
      setTasks(tRes?.data?.tasks || tRes?.data || []);
      setProposals(pRes?.data?.proposals || pRes?.data || []);
      setDeployments(dRes?.data?.deployments || dRes?.data || []);
      setMessages(msgRes?.data?.messages || msgRes?.data || []);

      try {
        const hRes = await api.handover.getByProject(projectId);
        setHandover(hRes?.data?.handover || null);
      } catch (e) {
        setHandover(null);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    }
  };

  useEffect(() => {
    loadClientData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject) return;

    try {
      await api.messages.send({
        projectId: selectedProject.id,
        content: newMessage.trim()
      });
      setNewMessage('');
      const msgRes = await api.messages.getByProject(selectedProject.id);
      setMessages(msgRes?.data?.messages || msgRes?.data || []);
    } catch (err) {
      alert('Could not send message: ' + err.message);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    setActionLoading(true);
    try {
      await api.proposals.respond(proposalId, 'ACCEPT');
      setNotification('Proposal accepted! Order and initial milestones generated.');
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      alert('Error accepting proposal: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    setActionLoading(true);
    try {
      await api.milestones.approve(milestoneId);
      setNotification('Milestone approved successfully!');
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      alert('Error approving milestone: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayMilestone = async (milestone) => {
    setActionLoading(true);
    try {
      const ordersRes = await api.orders.list();
      const order = ordersRes?.data?.[0];
      if (!order) {
        alert('No active order found for this project.');
        return;
      }

      const payRes = await api.payments.initialize({
        orderId: order.id,
        milestoneId: milestone.id,
        amountNgn: parseFloat(milestone.amount_ngn)
      });

      if (payRes?.data?.authorizationUrl) {
        // Open Paystack checkout (or mock simulator) in new tab
        window.open(payRes.data.authorizationUrl, '_blank');
        setNotification('Payment checkout launched. Complete payment in checkout window.');
      }
    } catch (err) {
      alert('Payment initialization failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClientSignoff = async () => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await api.handover.signoff(selectedProject.id, 'CLIENT');
      setNotification('GitHub handover sign-off confirmed! Project successfully completed.');
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      alert('Sign-off error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await api.reviews.submit({
        projectId: selectedProject.id,
        rating: reviewRating,
        title: reviewTitle,
        feedbackText: reviewFeedback
      });
      setNotification('Thank you! Your testimonial has been submitted.');
      setReviewTitle('');
      setReviewFeedback('');
    } catch (err) {
      alert('Review error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top Header */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBackToLanding}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              ← Back to Landing
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket size={16} color="#032014" />
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Client Workspace</strong>
              <span className="badge badge-emerald">CLIENT PORTAL</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button onClick={() => setIdeaModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Submit New Idea</span>
            </button>
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ padding: 'clamp(1.25rem, 3vw, 2rem) clamp(0.75rem, 2.5vw, 1.5rem) 5rem' }}>
        {notification && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            color: 'var(--accent-emerald-light)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-float" style={{ margin: '0 auto 1rem', color: 'var(--accent-emerald)' }} />
            <p>Loading your project workspace...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Rocket size={42} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>You have no active projects yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
              Submit your idea to begin. Our engineers will review the problem, freeze the MVP scope, and create a fixed milestone proposal for you.
            </p>
            <button onClick={() => setIdeaModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Submit My First Idea</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Project Banner Card */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 60%)',
              borderColor: 'var(--border-card)',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span className="badge badge-emerald">{selectedProject.status}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedProject.id.slice(0, 8)}...</span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.35rem' }}>{selectedProject.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '720px' }}>
                    {selectedProject.description || 'Production web MVP for Nigerian market with automated Paystack checkout.'}
                  </p>
                </div>

                {deployments.length > 0 && (
                  <a
                    href={deployments[0].deployment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem' }}
                  >
                    <span>View Live Staging</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* 7-Stage Visual Roadmap Stepper */}
              <div style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 80px), 1fr))',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                {['01 Clarify', '02 Define', '03 Scope', '04 Build', '05 Deploy', '06 Handover', '07 Validate'].map((stage, idx) => (
                  <div key={idx} style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: idx <= 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: idx <= 3 ? 'var(--accent-emerald-light)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {stage}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-header">
              <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                <Rocket size={16} />
                <span>Overview & Proposals</span>
              </button>
              <button onClick={() => setActiveTab('milestones')} className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}>
                <CheckCircle2 size={16} />
                <span>Milestones ({milestones.length})</span>
              </button>
              <button onClick={() => setActiveTab('tasks')} className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}>
                <Layers size={16} />
                <span>Task Board ({tasks.length})</span>
              </button>
              <button onClick={() => setActiveTab('messages')} className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}>
                <MessageSquare size={16} />
                <span>Developer Chat ({messages.length})</span>
              </button>
              <button onClick={() => setActiveTab('handover')} className={`tab-btn ${activeTab === 'handover' ? 'active' : ''}`}>
                <GithubIcon size={16} />
                <span>GitHub Handover</span>
              </button>
              <button onClick={() => setActiveTab('review')} className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}>
                <Star size={16} />
                <span>Leave Review</span>
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW & PROPOSALS */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {proposals.length > 0 && proposals[0].status === 'PENDING' && (
                  <div className="card" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span className="badge badge-indigo">NEW PROPOSAL RECEIVED</span>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginTop: '0.4rem' }}>{proposals[0].title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Timeline: {proposals[0].duration_days} Days • Total Fixed Quote: <strong style={{ color: 'var(--accent-emerald-light)' }}>₦{parseFloat(proposals[0].price_ngn).toLocaleString()}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptProposal(proposals[0].id)}
                        disabled={actionLoading}
                        className="btn btn-primary"
                      >
                        <CheckCircle2 size={16} />
                        <span>Accept Proposal & Generate Order</span>
                      </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Deliverables:</div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {(Array.isArray(proposals[0].deliverables) ? proposals[0].deliverables : []).map((d, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CheckCircle2 size={14} color="var(--accent-emerald)" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
                  <div className="card">
                    <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>Assigned Engineer</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        {selectedProject.developer_name ? selectedProject.developer_name.charAt(0) : 'E'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{selectedProject.developer_name || 'Senior MVP Engineer'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedProject.developer_email || 'developer@mvplaunch.ng'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>Repository & Code</h4>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {selectedProject.repo_url ? (
                        <a href={selectedProject.repo_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-emerald-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <GithubIcon size={16} />
                          <span>{selectedProject.repo_url}</span>
                        </a>
                      ) : (
                        <span>Repository initialized upon Phase 1 signoff</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MILESTONES & PAYSTACK ESCROW */}
            {activeTab === 'milestones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Milestone funds are securely held and only disbursed when you inspect and approve each stage:
                </p>

                {milestones.map((m, idx) => (
                  <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-emerald">Phase {m.order_index || idx + 1}</span>
                        <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{m.title}</strong>
                        <span className={`badge ${m.status === 'APPROVED' || m.status === 'PAID' ? 'badge-emerald' : m.status === 'SUBMITTED' ? 'badge-amber' : 'badge-outline'}`}>
                          {m.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>{m.description}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                        ₦{parseFloat(m.amount_ngn).toLocaleString()}
                      </span>

                      {m.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleApproveMilestone(m.id)}
                          disabled={actionLoading}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve Milestone</span>
                        </button>
                      )}

                      {m.status === 'PENDING' && (
                        <button
                          onClick={() => handlePayMilestone(m)}
                          disabled={actionLoading}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.4rem', borderColor: 'var(--accent-emerald)' }}
                        >
                          <CreditCard size={14} color="var(--accent-emerald)" />
                          <span>Pay via Paystack</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. TASKS */}
            {activeTab === 'tasks' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                {tasks.map((t) => (
                  <div key={t.id} className="card" style={{ background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className={`badge ${t.status === 'DONE' ? 'badge-emerald' : t.status === 'IN_PROGRESS' ? 'badge-amber' : 'badge-outline'}`}>
                        {t.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Priority: {t.priority}</span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.35rem' }}>{t.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 4. MESSAGES */}
            {activeTab === 'messages' && (
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '550px' }}>
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  Project Communication Thread
                </h4>

                {/* Message Log */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.5rem' }}>
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMe ? 'var(--accent-emerald-dark)' : 'var(--bg-surface)',
                        color: isMe ? '#fff' : 'var(--text-primary)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isMe ? 'none' : '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: isMe ? '#a7f3d0' : 'var(--text-muted)', marginBottom: '0.2rem' }}>
                          {isMe ? 'You' : msg.sender_name || 'Engineer'}
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{msg.content}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <input
                    type="text"
                    placeholder="Type your message or feedback for the developer..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* 5. GITHUB HANDOVER */}
            {activeTab === 'handover' && (
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <GithubIcon size={28} color="#fff" />
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>GitHub Handover Package</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Transfer of source code, deployment scripts, and credentials.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <strong>Repository: </strong>
                    <code style={{ color: 'var(--accent-emerald-light)', wordBreak: 'break-all' }}>
                      {handover?.github_repo || 'https://github.com/mvplaunch-ng/quickretail-mvp'}
                    </code>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <strong>Documentation: </strong>
                    <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {handover?.documentation_url || 'https://docs.mvplaunch.ng/projects/quickretail'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClientSignoff}
                  disabled={actionLoading || handover?.client_signoff_at}
                  className="btn btn-primary btn-lg"
                >
                  <ShieldCheck size={18} />
                  <span>{handover?.client_signoff_at ? 'Handover Signed & Completed' : 'Confirm Client Sign-off'}</span>
                </button>
              </div>
            )}

            {/* 6. REVIEWS */}
            {activeTab === 'review' && (
              <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(1.15rem, 4vw, 2rem)' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>Leave a Verified Review</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Help other Nigerian students and founders know what it was like building with MVPLaunch NG.
                </p>

                <form onSubmit={handleSubmitReview}>
                  <div className="form-group">
                    <label className="form-label">Rating (1 to 5 Stars)</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                      className="form-select"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                      <option value="3">⭐⭐⭐ (3/5 Good)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Review Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Launched our working MVP in 3 weeks!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Honest Feedback</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share your experience working with the team, meeting deadlines, and seeing your product go live..."
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      className="form-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    <span>{actionLoading ? 'Submitting...' : 'Submit Verified Testimonial'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
