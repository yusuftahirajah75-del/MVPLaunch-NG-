import React, { useState, useEffect } from 'react';
import {
  Code, CheckSquare, CloudUpload, RefreshCw, Send, CheckCircle2,
  ArrowRight, ShieldCheck, Clock, FileText, ExternalLink, AlertCircle,
  MessageSquare, ChevronRight, AlertTriangle, Layers, UserCheck, Play
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DeveloperPortal({ onBackToLanding }) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectNotes, setProjectNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notePosting, setNotePosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Progress Update Form State
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedFeatures, setCompletedFeatures] = useState('');
  const [knownLimitations, setKnownLimitations] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');

  // Submit Deliverable Form State
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [deliverableTitle, setDeliverableTitle] = useState('MVP Sprint Deliverable');
  const [stagingUrl, setStagingUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [productionUrl, setProductionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDeveloperTasks = async () => {
    setLoading(true);
    try {
      const res = await api.projects.list();
      const projList = res?.data?.projects || res?.data || [];
      setProjects(projList);
      if (projList.length > 0) {
        const current = selectedProject ? projList.find(p => p.id === selectedProject.id) || projList[0] : projList[0];
        setSelectedProject(current);
        await selectTask(current);
      }
    } catch (err) {
      console.error('Error loading developer tasks:', err);
      showToast('Error loading assigned tasks: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectTask = async (proj) => {
    setSelectedProject(proj);
    setProgressPercent(proj.progress_percent || 0);
    setCompletedFeatures(
      Array.isArray(proj.completed_features)
        ? proj.completed_features.join('\n')
        : proj.completed_features || ''
    );
    setKnownLimitations(proj.known_limitations || '');
    setDeliverableNotes(proj.deliverable_notes || '');

    // Load project notes
    try {
      const res = await api.projects.getNotes(proj.id);
      setProjectNotes(res?.data?.notes || []);
    } catch (err) {
      setProjectNotes([]);
    }
  };

  useEffect(() => {
    loadDeveloperTasks();
  }, []);

  // Action 1: Accept Assigned Task
  const handleAcceptTask = async () => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await api.projects.accept(selectedProject.id);
      showToast('Task accepted! Ready for development.');
      await loadDeveloperTasks();
    } catch (err) {
      showToast(err.message || 'Could not accept task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 2: Update Progress & Notes
  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await api.projects.updateProgress(selectedProject.id, {
        progressPercent: Number(progressPercent),
        completedFeatures: completedFeatures.trim() || null,
        knownLimitations: knownLimitations.trim() || null,
        deliverableNotes: deliverableNotes.trim() || null,
        status: selectedProject.status === 'ACCEPTED' ? 'IN_DEVELOPMENT' : selectedProject.status
      });
      showToast('Development progress and notes updated!');
      await loadDeveloperTasks();
    } catch (err) {
      showToast(err.message || 'Failed to update progress', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 3: Submit Deliverable for Admin Review
  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!stagingUrl.trim() && !repoUrl.trim()) {
      showToast('Please provide at least a Staging URL or GitHub Repository URL', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await api.projects.submitDeliverable(selectedProject.id, {
        title: deliverableTitle.trim(),
        stagingUrl: stagingUrl.trim() || null,
        repoUrl: repoUrl.trim() || null,
        productionUrl: productionUrl.trim() || null,
        notes: submissionNotes.trim() || null
      });
      showToast('Deliverable submitted! Moved to Internal Review (QA).');
      setDeliverableModalOpen(false);
      setStagingUrl('');
      setRepoUrl('');
      setSubmissionNotes('');
      await loadDeveloperTasks();
    } catch (err) {
      showToast(err.message || 'Failed to submit deliverable', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 4: Post Project Communication Note
  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedProject) return;
    setNotePosting(true);
    try {
      await api.projects.addNote(selectedProject.id, {
        content: newNote.trim(),
        noteType: 'INTERNAL',
        isInternal: true
      });
      setNewNote('');
      const res = await api.projects.getNotes(selectedProject.id);
      setProjectNotes(res?.data?.notes || []);
      showToast('Note posted to project communication thread.');
    } catch (err) {
      showToast(err.message || 'Could not post note', 'error');
    } finally {
      setNotePosting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '3rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

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
              ← Public Site
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
              }}>
                <Code size={18} color="#fff" />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Software Engineer Workspace
                </strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Assigned MVP Projects • Scoped Technical Specs • Direct Admin Handover
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#c7d2fe', fontWeight: 600 }}>
              {user?.full_name || user?.email}
            </span>
            <button onClick={loadDeveloperTasks} className="btn btn-secondary btn-sm" disabled={loading} style={{ gap: '0.35rem' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Tasks</span>
            </button>
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '1.5rem' }}>
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
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckSquare size={32} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              No Active Projects Assigned Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              You are currently registered as an active Software Engineer. When the Platform Director scopes and assigns an MVP project matching your tech stack, it will appear here immediately.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Left Sidebar: My Tasks List */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>My Assigned Tasks</span>
                <span className="badge badge-indigo">{projects.length} Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {projects.map(proj => {
                  const isSelected = selectedProject?.id === proj.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => selectTask(proj)}
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                        border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                          {proj.project_code || 'PRJ-CODE'}
                        </span>
                        <span className={`badge ${
                          proj.status === 'COMPLETED' || proj.status === 'APPROVED' ? 'badge-emerald' :
                          proj.status === 'INTERNAL_REVIEW' ? 'badge-amber' :
                          proj.status === 'REVISION_REQUIRED' ? 'badge-rose' :
                          'badge-indigo'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {proj.status}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {proj.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{proj.industry}</span>
                        {proj.priority && (
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>{proj.priority}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Main Pane: Task Details & Development Workflow */}
            {selectedProject && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Task Header & Lifecycle Status Actions */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                          {selectedProject.project_code || 'PRJ-RECORD'}
                        </span>
                        <span className="badge badge-indigo">{selectedProject.industry}</span>
                        <span className="badge badge-emerald">{selectedProject.selected_package_name || selectedProject.order_package_name || 'Launch Package'}</span>
                        {selectedProject.priority && <span className="badge badge-amber">{selectedProject.priority} PRIORITY</span>}
                      </div>
                      <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>
                        {selectedProject.title}
                      </h2>
                    </div>

                    {/* Primary Workflow Triggers */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {selectedProject.status === 'ENGINEER_ASSIGNED' && (
                        <button
                          onClick={handleAcceptTask}
                          disabled={actionLoading}
                          className="btn btn-primary"
                          style={{ gap: '0.4rem', background: 'var(--accent-emerald)', color: '#032014', fontWeight: 700 }}
                        >
                          <Play size={16} />
                          <span>Accept Assigned Task</span>
                        </button>
                      )}

                      {['ACCEPTED', 'IN_DEVELOPMENT', 'REVISION_REQUIRED'].includes(selectedProject.status) && (
                        <button
                          onClick={() => setDeliverableModalOpen(true)}
                          className="btn btn-primary"
                          style={{ gap: '0.4rem' }}
                        >
                          <CloudUpload size={16} />
                          <span>Submit Deliverables for Review</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Revision Required Alert if Admin sent feedback */}
                  {selectedProject.status === 'REVISION_REQUIRED' && (
                    <div style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      color: '#fda4af',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Revision Requested by Admin:</strong> Please review the internal notes and deliverable feedback below, adjust the code, and re-submit your staging URL.
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <span>Development Completion</span>
                      <strong style={{ color: 'var(--accent-emerald-light)' }}>{progressPercent}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Section A: Approved Technical Specifications & Admin Instructions */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#c7d2fe', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} color="#818cf8" />
                    <span>Admin Instructions & Technical Architecture Brief</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                    <div>
                      <strong style={{ color: '#a5b4fc', fontSize: '0.78rem', display: 'block' }}>Admin Instructions:</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0', lineHeight: '1.5' }}>
                        {selectedProject.admin_instructions || 'Follow production guidelines for responsive Nigerian web MVP.'}
                      </p>
                    </div>

                    <div>
                      <strong style={{ color: '#a5b4fc', fontSize: '0.78rem', display: 'block' }}>Acceptance Criteria:</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0', lineHeight: '1.5' }}>
                        {selectedProject.acceptance_criteria || 'Working deployed web MVP, clean Git repository, and responsive design.'}
                      </p>
                    </div>

                    {selectedProject.internal_deadline && (
                      <div style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                        Target Internal Delivery Deadline: <strong>{new Date(selectedProject.internal_deadline).toLocaleDateString()}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: Complete Project Brief from Client */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={18} color="var(--accent-emerald)" />
                    <span>Complete Client Product Brief</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Problem Being Solved</span>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{selectedProject.problem_statement || selectedProject.description}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Target Audience</span>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{selectedProject.target_users || '—'}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Proposed Solution</span>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{selectedProject.proposed_solution || '—'}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Core MVP Features (Must-Haves)</span>
                      {Array.isArray(selectedProject.core_features) && selectedProject.core_features.length > 0 ? (
                        <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#e2e8f0' }}>
                          {selectedProject.core_features.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      ) : (
                        <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{JSON.stringify(selectedProject.core_features) || '—'}</p>
                      )}
                    </div>

                    {selectedProject.technical_requirements && (
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Technical Requirements</span>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{selectedProject.technical_requirements}</p>
                      </div>
                    )}

                    {selectedProject.attachment_url && (
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Client Attachment</span>
                        <a href={selectedProject.attachment_url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <ExternalLink size={14} />
                          <span>View Reference Link</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section C: Progress Updates & Documentation Form */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckSquare size={18} color="#818cf8" />
                    <span>Update Development Progress & Notes</span>
                  </h4>

                  <form onSubmit={handleUpdateProgress}>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Progress Percentage</span>
                        <strong style={{ color: 'var(--accent-emerald-light)' }}>{progressPercent}%</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressPercent}
                        onChange={(e) => setProgressPercent(e.target.value)}
                        style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Completed Features So Far (1 per line)</label>
                      <textarea
                        rows={3}
                        value={completedFeatures}
                        onChange={(e) => setCompletedFeatures(e.target.value)}
                        placeholder="• Implemented Paystack transaction checkout&#10;• Created responsive landing page layout"
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Known Limitations / In-Progress Items</label>
                      <textarea
                        rows={2}
                        value={knownLimitations}
                        onChange={(e) => setKnownLimitations(e.target.value)}
                        placeholder="Document any pending APIs, edge cases, or mocked responses..."
                        className="form-textarea"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="btn btn-secondary"
                      style={{ padding: '0.65rem 1.25rem' }}
                    >
                      {actionLoading ? 'Saving...' : 'Save Progress Update'}
                    </button>
                  </form>
                </div>

                {/* Section D: Admin ↔ Engineer Communication Thread (Requirement 11) */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={18} color="#818cf8" />
                    <span>Project Technical Notes & Questions for Admin</span>
                  </h4>

                  <div style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    padding: '0.5rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {projectNotes.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>
                        No notes yet. Ask questions or leave updates for the Platform Director here.
                      </div>
                    ) : (
                      projectNotes.map(n => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.6rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            background: n.author_role === 'ADMIN' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                            borderLeft: `3px solid ${n.author_role === 'ADMIN' ? '#f59e0b' : '#818cf8'}`
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                            <strong style={{ color: '#fff' }}>{n.author_name} ({n.author_role})</strong>
                            <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                            {n.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handlePostNote} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Ask technical question or provide status update to Director..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button type="submit" disabled={notePosting || !newNote.trim()} className="btn btn-primary btn-sm">
                      <Send size={14} />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUBMIT DELIVERABLE MODAL                                  */}
      {/* ========================================================= */}
      {deliverableModalOpen && selectedProject && (
        <div className="modal-overlay" onClick={() => setDeliverableModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(620px, 95vw)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Submit Deliverables for QA Review
              </h3>
              <button onClick={() => setDeliverableModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                X
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Submitting transitions project <strong>{selectedProject.project_code}</strong> to <code>INTERNAL_REVIEW</code> for the Platform Director to verify acceptance criteria before client handoff.
            </p>

            <form onSubmit={handleSubmitDeliverable}>
              <div className="form-group">
                <label className="form-label">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={deliverableTitle}
                  onChange={(e) => setDeliverableTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Live Staging Preview URL (e.g. Vercel / Render preview)</label>
                <input
                  type="url"
                  value={stagingUrl}
                  onChange={(e) => setStagingUrl(e.target.value)}
                  placeholder="https://mvp-staging.vercel.app"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Release Notes & Verification Instructions</label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Notes for the Director to verify features, test accounts, or environment variables..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {actionLoading ? 'Submitting...' : 'Submit to Admin QA Review'}
                </button>
                <button type="button" onClick={() => setDeliverableModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
