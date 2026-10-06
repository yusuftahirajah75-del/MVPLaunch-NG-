import React, { useState, useEffect } from 'react';
import { Code, CheckSquare, CloudUpload, RefreshCw, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DeveloperPortal({ onBackToLanding }) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // New deployment form
  const [deployUrl, setDeployUrl] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [envType, setEnvType] = useState('STAGING');

  const loadDeveloperData = async () => {
    setLoading(true);
    try {
      const res = await api.projects.list();
      const projList = res?.data || [];
      setProjects(projList);
      if (projList.length > 0) {
        setSelectedProject(projList[0]);
        await loadProjectDetails(projList[0].id);
      }
    } catch (err) {
      console.error('Error loading developer projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      const [tRes, mRes, dRes, msgRes] = await Promise.all([
        api.tasks.getByProject(projectId).catch(() => ({ data: [] })),
        api.milestones.getByProject(projectId).catch(() => ({ data: [] })),
        api.deployments.getByProject(projectId).catch(() => ({ data: [] })),
        api.messages.getByProject(projectId).catch(() => ({ data: [] }))
      ]);

      setTasks(tRes?.data?.tasks || tRes?.data || []);
      setMilestones(mRes?.data?.milestones || mRes?.data || []);
      setDeployments(dRes?.data?.deployments || dRes?.data || []);
      setMessages(msgRes?.data?.messages || msgRes?.data || []);
    } catch (err) {
      console.error('Error loading details:', err);
    }
  };

  useEffect(() => {
    loadDeveloperData();
  }, []);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setActionLoading(true);
    try {
      await api.tasks.update(taskId, { status: newStatus });
      setNotification(`Task status updated to ${newStatus}`);
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      alert('Error updating task: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitMilestone = async (milestoneId) => {
    setActionLoading(true);
    try {
      await api.milestones.submit(milestoneId);
      setNotification('Milestone submitted to client for approval!');
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      alert('Error submitting milestone: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordDeployment = async (e) => {
    e.preventDefault();
    if (!deployUrl.trim() || !selectedProject) return;

    setActionLoading(true);
    try {
      await api.deployments.record({
        projectId: selectedProject.id,
        environment: envType,
        deploymentUrl: deployUrl.trim(),
        commitHash: commitHash.trim() || 'main'
      });
      setNotification('Deployment logged successfully!');
      setDeployUrl('');
      setCommitHash('');
      await loadProjectDetails(selectedProject.id);
    } catch (err) {
      alert('Deployment error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
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
            <button onClick={onBackToLanding} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              ← Landing
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code size={16} color="#fff" />
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Developer Workspace</strong>
              <span className="badge badge-indigo">ENGINEER</span>
            </div>
          </div>

          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
            Sign Out ({user?.full_name?.split(' ')[0]})
          </button>
        </div>
      </header>

      <main className="container" style={{ padding: 'clamp(1.25rem, 3vw, 2rem) clamp(0.75rem, 2.5vw, 1.5rem) 5rem' }}>
        {notification && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            color: '#a5b4fc',
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
            <button onClick={() => setNotification(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <RefreshCw size={28} className="animate-float" style={{ color: 'var(--accent-indigo)' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading developer projects...</p>
          </div>
        ) : !selectedProject ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>No projects currently assigned</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You will see assigned projects here once the platform director assigns you.</p>
          </div>
        ) : (
          <div>
            {/* Project Overview Card */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>{selectedProject.status}</span>
                  <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>{selectedProject.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Client: <strong style={{ color: '#fff' }}>{selectedProject.client_name}</strong> ({selectedProject.client_email})
                  </p>
                </div>
              </div>
            </div>

            {/* Main Developer Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
              {/* Column 1: Task Management */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={18} color="var(--accent-emerald)" />
                  <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Tasks ({tasks.length})</h3>
                </div>

                {tasks.map((task) => (
                  <div key={task.id} className="card" style={{ background: 'var(--bg-card)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className={`badge ${task.status === 'DONE' ? 'badge-emerald' : task.status === 'IN_PROGRESS' ? 'badge-amber' : 'badge-outline'}`}>
                        {task.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{task.priority} Priority</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{task.title}</div>
                    
                    {/* Status change actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                      {task.status !== 'TODO' && (
                        <button onClick={() => handleUpdateTaskStatus(task.id, 'TODO')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem' }}>
                          Mark Todo
                        </button>
                      )}
                      {task.status !== 'IN_PROGRESS' && (
                        <button onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem' }}>
                          In Progress
                        </button>
                      )}
                      {task.status !== 'DONE' && (
                        <button onClick={() => handleUpdateTaskStatus(task.id, 'DONE')} className="btn btn-primary btn-sm" style={{ fontSize: '0.72rem' }}>
                          Complete ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Milestones & Deployments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Milestones Submission */}
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>Project Milestones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {milestones.map((m) => (
                      <div key={m.id} style={{ padding: '0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{m.title}</strong>
                          <span className={`badge ${m.status === 'APPROVED' ? 'badge-emerald' : m.status === 'SUBMITTED' ? 'badge-amber' : 'badge-outline'}`}>
                            {m.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                          Amount: ₦{parseFloat(m.amount_ngn).toLocaleString()}
                        </div>
                        {m.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleSubmitMilestone(m.id)}
                            disabled={actionLoading}
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', fontSize: '0.8rem' }}
                          >
                            Submit for Client Approval →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Log Deployment */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <CloudUpload size={18} color="var(--accent-indigo)" />
                    <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Log Deployment URL</h3>
                  </div>

                  <form onSubmit={handleRecordDeployment}>
                    <div className="form-group">
                      <label className="form-label">Environment</label>
                      <select value={envType} onChange={(e) => setEnvType(e.target.value)} className="form-select">
                        <option value="STAGING">Staging Environment</option>
                        <option value="PRODUCTION">Production Environment</option>
                        <option value="PREVIEW">Feature Preview</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Live Deployment URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://staging-app.mvplaunch.ng"
                        value={deployUrl}
                        onChange={(e) => setDeployUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Commit Hash (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 9f81a7b"
                        value={commitHash}
                        onChange={(e) => setCommitHash(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      <span>Update Live Deployment</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
