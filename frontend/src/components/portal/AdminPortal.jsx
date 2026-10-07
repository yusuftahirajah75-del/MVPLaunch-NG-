import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, TrendingUp, DollarSign, Database,
  Activity, RefreshCw, FileText, CheckCircle2, Clock,
  Package, ShoppingBag, ExternalLink, Filter, AlertTriangle,
  ArrowUpRight, UserCheck, MessageSquare, Code, CheckSquare,
  Search, ChevronRight, X, AlertCircle, Send, Eye, ShieldCheck,
  Briefcase, Calendar, Star, Tag, ChevronDown, Check
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminPortal({ onBackToLanding }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'projects' | 'kpis' | 'audit'
  
  // Data State
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'
  const [orderPackageFilter, setOrderPackageFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');
  const [projectSearch, setProjectSearch] = useState('');

  // Selected Records for Modals / Dossier
  const [inspectOrder, setInspectOrder] = useState(null);
  const [inspectProject, setInspectProject] = useState(null);
  const [activeProjectNotes, setActiveProjectNotes] = useState([]);
  const [newProjectNote, setNewProjectNote] = useState('');
  const [notePosting, setNotePosting] = useState(false);

  // Scoping Modal State
  const [scopingModalOpen, setScopingModalOpen] = useState(false);
  const [scopeAdminNotes, setScopeAdminNotes] = useState('');
  const [scopeAdminInstructions, setScopeAdminInstructions] = useState('');
  const [scopeAcceptanceCriteria, setScopeAcceptanceCriteria] = useState('');
  const [scopeInternalDeadline, setScopeInternalDeadline] = useState('');
  const [scopePriority, setScopePriority] = useState('NORMAL');
  const [scopingLoading, setScopingLoading] = useState(false);

  // Engineer Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignPriority, setAssignPriority] = useState('NORMAL');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Deliverable Review Modal State
  const [reviewDeliverableModalOpen, setReviewDeliverableModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Mark Delivered Modal State
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [deliveryProductionUrl, setDeliveryProductionUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveringLoading, setDeliveringLoading] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, hRes, oRes, pRes, eRes, aRes] = await Promise.all([
        api.admin.getMetrics().catch(() => ({ data: { metrics: null } })),
        api.admin.getHealth().catch(() => ({ data: { health: null } })),
        api.admin.getOrders('?limit=100').catch(() => ({ data: { orders: [] } })),
        api.projects.list('?limit=100').catch(() => ({ data: { projects: [] } })),
        api.projects.listEngineers().catch(() => ({ data: { engineers: [] } })),
        api.admin.listAuditLogs('?limit=40').catch(() => ({ data: { auditLogs: [] } }))
      ]);

      setMetrics(mRes?.data?.metrics || null);
      setHealth(hRes?.data?.health || null);
      setOrders(oRes?.data?.orders || []);
      setProjects(pRes?.data?.projects || []);
      setEngineers(eRes?.data?.engineers || []);
      setAuditLogs(aRes?.data?.auditLogs || aRes?.data || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
      showToast('Failed to load some dashboard data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Open Full Project Dossier
  const openProjectDossier = async (projectId) => {
    try {
      const res = await api.projects.getById(projectId);
      const proj = res?.data?.project || res?.data;
      setInspectProject(proj);
      if (proj) {
        // Load notes
        const nRes = await api.projects.getNotes(proj.id).catch(() => ({ data: { notes: [] } }));
        setActiveProjectNotes(nRes?.data?.notes || []);
        // Pre-fill scoping
        setScopeAdminNotes(proj.admin_notes || '');
        setScopeAdminInstructions(proj.admin_instructions || '');
        setScopeAcceptanceCriteria(proj.acceptance_criteria || '');
        setScopeInternalDeadline(proj.internal_deadline ? proj.internal_deadline.split('T')[0] : '');
        setScopePriority(proj.priority || 'NORMAL');
        // Pre-fill assignment
        setSelectedEngineerId(proj.developer_id || '');
        setAssignInstructions(proj.admin_instructions || '');
        setAssignPriority(proj.priority || 'NORMAL');
        setAssignDeadline(proj.internal_deadline ? proj.internal_deadline.split('T')[0] : '');
      }
    } catch (err) {
      showToast('Error opening project dossier: ' + err.message, 'error');
    }
  };

  // Submit Technical Scoping
  const handleSaveScope = async (e) => {
    e.preventDefault();
    if (!inspectProject) return;
    setScopingLoading(true);
    try {
      await api.projects.updateScope(inspectProject.id, {
        adminNotes: scopeAdminNotes,
        adminInstructions: scopeAdminInstructions,
        acceptanceCriteria: scopeAcceptanceCriteria,
        internalDeadline: scopeInternalDeadline || null,
        priority: scopePriority,
        status: inspectProject.developer_id ? inspectProject.status : 'AWAITING_ENGINEER'
      });
      showToast('Project technical scope successfully saved & updated!');
      setScopingModalOpen(false);
      await openProjectDossier(inspectProject.id);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to save technical scope', 'error');
    } finally {
      setScopingLoading(false);
    }
  };

  // Assign Engineer
  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    if (!inspectProject) return;
    setAssignLoading(true);
    try {
      await api.projects.assignEngineer(inspectProject.id, {
        developerId: selectedEngineerId || null,
        instructions: assignInstructions,
        priority: assignPriority,
        internalDeadline: assignDeadline || null
      });
      showToast(selectedEngineerId ? 'Software Engineer assigned successfully!' : 'Engineer unassigned from project.');
      setAssignModalOpen(false);
      await openProjectDossier(inspectProject.id);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to assign engineer', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  // Review Deliverable
  const handleReviewDeliverable = async (e) => {
    e.preventDefault();
    if (!selectedDeliverable) return;
    setReviewLoading(true);
    try {
      await api.projects.reviewDeliverable(selectedDeliverable.id, {
        status: reviewStatus,
        adminFeedback: reviewFeedback
      });
      showToast(reviewStatus === 'APPROVED' ? 'Deliverable approved!' : 'Revision request sent to engineer.');
      setReviewDeliverableModalOpen(false);
      if (inspectProject) await openProjectDossier(inspectProject.id);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to review deliverable', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  // Mark Delivered
  const handleMarkDelivered = async (e) => {
    e.preventDefault();
    if (!inspectProject) return;
    setDeliveringLoading(true);
    try {
      await api.projects.markDelivered(inspectProject.id, {
        productionUrl: deliveryProductionUrl,
        deliveryNotes
      });
      showToast('Project marked as delivered to client! Order fulfilled.');
      setDeliverModalOpen(false);
      await openProjectDossier(inspectProject.id);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to mark project delivered', 'error');
    } finally {
      setDeliveringLoading(false);
    }
  };

  // Post Communication Note
  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!newProjectNote.trim() || !inspectProject) return;
    setNotePosting(true);
    try {
      await api.projects.addNote(inspectProject.id, {
        content: newProjectNote.trim(),
        noteType: 'INTERNAL',
        isInternal: true
      });
      setNewProjectNote('');
      const nRes = await api.projects.getNotes(inspectProject.id);
      setActiveProjectNotes(nRes?.data?.notes || []);
      showToast('Instruction/note posted.');
    } catch (err) {
      showToast(err.message || 'Could not post note', 'error');
    } finally {
      setNotePosting(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'ALL' && o.payment_status !== orderFilter) return false;
    if (orderPackageFilter !== 'ALL' && o.package_id !== orderPackageFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = o.id?.toLowerCase().includes(q);
      const matchClient = o.client_name?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q);
      const matchEmail = o.client_email?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q);
      const matchRef = o.paystack_ref?.toLowerCase().includes(q) || o.provider_reference?.toLowerCase().includes(q);
      const matchProj = o.project_code?.toLowerCase().includes(q);
      if (!matchId && !matchClient && !matchEmail && !matchRef && !matchProj) return false;
    }
    return true;
  });

  // Filtered Projects
  const filteredProjects = projects.filter(p => {
    if (projectStatusFilter !== 'ALL' && p.status !== projectStatusFilter) return false;
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchCode = p.project_code?.toLowerCase().includes(q);
      const matchClient = p.client_name?.toLowerCase().includes(q);
      const matchDev = p.developer_name?.toLowerCase().includes(q);
      const matchInd = p.industry?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchClient && !matchDev && !matchInd) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
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
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
              }}>
                <ShieldAlert size={18} color="#000" />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  MVPLaunch NG Platform Director
                </strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Full Operational Control • Nigerian Client Service Architecture
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={loadAdminData} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header Navigation Tabs */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.5rem 0'
      }}>
        <div className="container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <ShoppingBag size={15} />
            <span>Package Orders</span>
            <span style={{
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.72rem'
            }}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`btn btn-sm ${activeTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <Briefcase size={15} />
            <span>Projects & Technical Scoping</span>
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
            onClick={() => setActiveTab('kpis')}
            className={`btn btn-sm ${activeTab === 'kpis' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <TrendingUp size={15} />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <FileText size={15} />
            <span>Idea & Audit Logs</span>
            <span style={{
              background: activeTab === 'audit' ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.72rem'
            }}>
              {auditLogs.length}
            </span>
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        {/* ========================================================= */}
        {/* TAB 1: PACKAGE ORDERS (SECTION 7)                         */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by Client, Email, Order ID, Ref, or Project Code..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
                  />
                </div>

                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', height: '36px', fontSize: '0.85rem', padding: '0 0.75rem' }}
                >
                  <option value="ALL">Payment: All Statuses</option>
                  <option value="PAID">PAID (Verified)</option>
                  <option value="PENDING">PENDING / INITIALIZED</option>
                </select>

                <select
                  value={orderPackageFilter}
                  onChange={(e) => setOrderPackageFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', height: '36px', fontSize: '0.85rem', padding: '0 0.75rem' }}
                >
                  <option value="ALL">All Packages</option>
                  <option value="idea-validation">Idea Validation</option>
                  <option value="student-project">Starter MVP (Student)</option>
                  <option value="founder-mvp">Growth MVP (Founder)</option>
                  <option value="business-digital">Advanced MVP (Business)</option>
                </select>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
              </div>
            </div>

            {/* Orders Table */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Client Details</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Selected Package</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Project Code & Stage</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Assigned Engineer</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No package orders found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {order.id?.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{order.client_name || order.customer_name || 'Client'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{order.client_email || order.customer_email}</div>
                          {order.client_phone && (
                            <div style={{ color: 'var(--accent-emerald-light)', fontSize: '0.74rem' }}>{order.client_phone}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{order.package_name || 'Custom Package'}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                          ₦{(order.total_amount_ngn || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`badge ${order.payment_status === 'PAID' ? 'badge-emerald' : 'badge-amber'}`}>
                            {order.payment_status}
                          </span>
                          {order.paystack_ref && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                              {order.paystack_ref.substring(0, 14)}...
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {order.project_id ? (
                            <div>
                              <button
                                onClick={() => openProjectDossier(order.project_id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#38bdf8',
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: 0,
                                  textDecoration: 'underline'
                                }}
                              >
                                {order.project_code || 'PRJ-DETAILS'}
                              </button>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {order.project_status || 'SUBMITTED'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                              {order.payment_status === 'PAID' ? 'Awaiting Client Brief' : 'Payment Incomplete'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {order.assigned_engineer_name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c7d2fe' }}>
                              <UserCheck size={14} color="#818cf8" />
                              <span>{order.assigned_engineer_name}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          {order.project_id ? (
                            <button
                              onClick={() => openProjectDossier(order.project_id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                            >
                              <Eye size={13} />
                              <span>Open Record</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setInspectOrder(order)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                            >
                              Inspect Order
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROJECTS & TECHNICAL SCOPING (SECTIONS 8, 9, 17, 18)*/}
        {/* ========================================================= */}
        {activeTab === 'projects' && (
          <div>
            {/* Filter Bar */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by Project Title, Code, Client, Engineer or Industry..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
                  />
                </div>

                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', height: '36px', fontSize: '0.85rem', padding: '0 0.75rem' }}
                >
                  <option value="ALL">All Lifecycle Stages</option>
                  <option value="SUBMITTED">SUBMITTED (New)</option>
                  <option value="ADMIN_SCOPING">ADMIN_SCOPING</option>
                  <option value="AWAITING_ENGINEER">AWAITING_ENGINEER</option>
                  <option value="ENGINEER_ASSIGNED">ENGINEER_ASSIGNED</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="IN_DEVELOPMENT">IN_DEVELOPMENT</option>
                  <option value="INTERNAL_REVIEW">INTERNAL_REVIEW (QA)</option>
                  <option value="REVISION_REQUIRED">REVISION_REQUIRED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredProjects.length}</strong> of {projects.length} projects
              </div>
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
              {filteredProjects.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'var(--bg-card)',
                  padding: '3rem',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)'
                }}>
                  No projects found for current filter.
                </div>
              ) : (
                filteredProjects.map(proj => (
                  <div
                    key={proj.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <div>
                      {/* Header with Project Code & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                            {proj.project_code || 'PRJ-CODE'}
                          </span>
                          <span style={{ margin: '0 0.35rem', color: 'var(--text-muted)' }}>•</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{proj.industry || 'Domain'}</span>
                        </div>
                        <span className={`badge ${
                          proj.status === 'COMPLETED' || proj.status === 'DELIVERED' || proj.status === 'APPROVED' ? 'badge-emerald' :
                          proj.status === 'INTERNAL_REVIEW' ? 'badge-amber' :
                          proj.status === 'IN_DEVELOPMENT' ? 'badge-indigo' :
                          'badge-blue'
                        }`} style={{ fontSize: '0.7rem' }}>
                          {proj.status}
                        </span>
                      </div>

                      {/* Project Title */}
                      <h4 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 0.4rem 0' }}>
                        {proj.title}
                      </h4>

                      {/* Client Info */}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Client: <strong style={{ color: '#e2e8f0' }}>{proj.client_name}</strong> ({proj.client_email})
                      </div>

                      {/* Package & Payment */}
                      <div style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.78rem',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>Package:</span>
                        <strong style={{ color: 'var(--accent-emerald-light)' }}>
                          {proj.selected_package_name || proj.order_package_name || 'Launch Package'}
                        </strong>
                      </div>

                      {/* Engineer Assignment Status */}
                      <div style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        {proj.developer_name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c7d2fe' }}>
                            <UserCheck size={14} color="#818cf8" />
                            <span>Engineer: <strong>{proj.developer_name}</strong></span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
                            <AlertCircle size={14} />
                            <span>Awaiting Engineer Assignment</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action to Open Workspace */}
                    <button
                      onClick={() => openProjectDossier(proj.id)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', marginTop: '0.5rem' }}
                    >
                      <span>Open Technical Dossier & Actions</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: OVERVIEW & KPIS (SECTION 6)                        */}
        {/* ========================================================= */}
        {activeTab === 'kpis' && metrics && (
          <div>
            {/* Top 4 KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Verified Platform Revenue</span>
                  <DollarSign size={16} color="var(--accent-emerald)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
                  ₦{(metrics.financials?.totalRevenueNgn || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {metrics.financials?.successfulTransactions} verified Paystack transactions
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Total Package Orders</span>
                  <ShoppingBag size={16} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                  {metrics.orders?.total || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <strong style={{ color: 'var(--accent-emerald-light)' }}>{metrics.orders?.paid} Paid</strong> • {metrics.orders?.pending} Pending
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Active Projects Pipeline</span>
                  <Briefcase size={16} color="#818cf8" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c7d2fe' }}>
                  {metrics.projects?.total || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {metrics.projects?.inDevelopment} In Dev • {metrics.projects?.awaitingReview} QA Review
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Active Engineers</span>
                  <Users size={16} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>
                  {metrics.engineers?.totalActive || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {metrics.users?.clients} Clients registered
                </div>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--accent-emerald)" />
                <span>Project Pipeline Lifecycle Breakdown</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>New Submissions</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>{metrics.projects?.newSubmissions}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Scoping</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24' }}>{metrics.projects?.inScoping}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Engineer</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171' }}>{metrics.projects?.awaitingAssignment}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#a78bfa' }}>{metrics.projects?.assigned}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Development</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#818cf8' }}>{metrics.projects?.inDevelopment}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Review (QA)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24' }}>{metrics.projects?.awaitingReview}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Revision</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171' }}>{metrics.projects?.inRevision}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed / Delivered</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>{metrics.projects?.completed}</div>
                </div>
              </div>
            </div>

            {/* Software Engineers Workload Table (Requirement 9 & 6) */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="#818cf8" />
                <span>Software Engineer Workload & Availability</span>
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Engineer</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Email</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Availability</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Skills & Specialization</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Active Tasks</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Completed Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engineers.map(eng => (
                      <tr key={eng.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#fff' }}>{eng.full_name}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{eng.email}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                            {eng.availability_status || 'AVAILABLE'}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>
                          {eng.skills || 'Full-Stack Web MVP'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#818cf8' }}>
                          {eng.active_projects || 0}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                          {eng.completed_projects || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: IDEA & AUDIT LOGS (SECTION 8)                      */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div>
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}>
              Chronological immutable audit log of verified payments, submissions, scoping decisions, assignments, reviews, and client deliveries.
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Entity</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actor</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${
                          log.action?.includes('PAYMENT') ? 'badge-emerald' :
                          log.action?.includes('SUBMITTED') ? 'badge-blue' :
                          log.action?.includes('ASSIGN') ? 'badge-indigo' :
                          'badge-amber'
                        }`} style={{ fontSize: '0.7rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0' }}>
                        {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ''}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#fff' }}>{log.user_name || 'System / Guest'}</strong>
                        {log.user_role && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> ({log.user_role})</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {log.details ? JSON.stringify(log.details).substring(0, 100) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* FULL CENTRAL PROJECT DOSSIER MODAL (SECTION 8, 9, 11, 17)  */}
      {/* ========================================================= */}
      {inspectProject && (
        <div className="modal-overlay" onClick={() => setInspectProject(null)} style={{ zIndex: 1100 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(920px, calc(100vw - 1.5rem))',
              maxHeight: 'calc(100vh - 2rem)',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 4vw, 2.25rem)',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem' }}>
                    {inspectProject.project_code || 'PRJ-RECORD'}
                  </span>
                  <span className={`badge ${
                    inspectProject.status === 'COMPLETED' || inspectProject.status === 'DELIVERED' ? 'badge-emerald' :
                    inspectProject.status === 'INTERNAL_REVIEW' ? 'badge-amber' :
                    'badge-indigo'
                  }`}>
                    {inspectProject.status}
                  </span>
                  {inspectProject.priority && (
                    <span className="badge badge-amber">{inspectProject.priority} PRIORITY</span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.45rem', color: '#fff', margin: 0 }}>
                  {inspectProject.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectProject(null)}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Action Buttons for Platform Director */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setScopingModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <FileText size={15} />
                <span>Scope Technical Specs</span>
              </button>

              <button
                onClick={() => setAssignModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem', borderColor: '#818cf8', color: '#c7d2fe' }}
              >
                <UserCheck size={15} color="#818cf8" />
                <span>{inspectProject.developer_id ? 'Reassign / Manage Engineer' : 'Assign Software Engineer'}</span>
              </button>

              {inspectProject.status === 'APPROVED' && (
                <button
                  onClick={() => setDeliverModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem', background: 'var(--accent-emerald)', color: '#032014' }}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Delivered to Client</span>
                </button>
              )}
            </div>

            {/* Section 1: Client & Payment Verification Summary */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client Name</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{inspectProject.client_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{inspectProject.client_email}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald-light)' }}>{inspectProject.client_phone || '—'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization / Domain</div>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{inspectProject.organization_name || 'Independent Founder'}</div>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>{inspectProject.industry}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Package & Payment</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                  {inspectProject.selected_package_name || inspectProject.package_name || 'Launch Package'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Paystack Ref: {inspectProject.payment_reference || inspectProject.paystack_ref || 'VERIFIED'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Engineer</div>
                <div style={{ fontWeight: 700, color: inspectProject.developer_name ? '#c7d2fe' : '#fbbf24' }}>
                  {inspectProject.developer_name || 'None (Awaiting Assignment)'}
                </div>
                {inspectProject.internal_deadline && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Deadline: {new Date(inspectProject.internal_deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Complete Submitted Idea / Product Brief */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Rocket size={16} color="var(--accent-emerald)" />
                <span>Submitted Idea & Product Specifications</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Problem Statement</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0', lineHeight: '1.5' }}>
                    {inspectProject.problem_statement || inspectProject.description}
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Target Users</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{inspectProject.target_users || '—'}</p>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Proposed Solution</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0', lineHeight: '1.5' }}>{inspectProject.proposed_solution || '—'}</p>
                </div>

                {/* Core Features */}
                <div>
                  <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Core MVP Features</strong>
                  {Array.isArray(inspectProject.core_features) && inspectProject.core_features.length > 0 ? (
                    <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#e2e8f0' }}>
                      {inspectProject.core_features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  ) : (
                    <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{JSON.stringify(inspectProject.core_features) || '—'}</p>
                  )}
                </div>

                {inspectProject.technical_requirements && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Technical Requirements</strong>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{inspectProject.technical_requirements}</p>
                  </div>
                )}

                {inspectProject.competitor_references && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Competitor References</strong>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#e2e8f0' }}>{inspectProject.competitor_references}</p>
                  </div>
                )}

                {inspectProject.attachment_url && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Attached Documents / Prototype</strong>
                    <a
                      href={inspectProject.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}
                    >
                      <ExternalLink size={14} />
                      <span>{inspectProject.attachment_url}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Technical Scoping & Admin Instructions */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#c7d2fe', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} />
                  <span>Admin Technical Scoping & Acceptance Criteria</span>
                </h4>
                <button onClick={() => setScopingModalOpen(true)} className="btn btn-ghost btn-sm" style={{ color: '#818cf8', fontSize: '0.78rem' }}>
                  Edit Scope
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Admin Instructions to Engineer: </span>
                  <span style={{ color: '#fff' }}>{inspectProject.admin_instructions || 'None provided yet. Click "Scope Technical Specs" to add.'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Acceptance Criteria: </span>
                  <span style={{ color: '#fff' }}>{inspectProject.acceptance_criteria || 'None defined yet.'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Admin Internal Notes: </span>
                  <span style={{ color: '#fff' }}>{inspectProject.admin_notes || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Engineer Deliverables & Staging URLs */}
            {inspectProject.deliverables && inspectProject.deliverables.length > 0 && (
              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Code size={16} color="var(--accent-emerald)" />
                  <span>Submitted Engineer Deliverables</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {inspectProject.deliverables.map(deliv => (
                    <div
                      key={deliv.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{deliv.title}</strong>
                        <span className={`badge ${deliv.status === 'APPROVED' ? 'badge-emerald' : deliv.status === 'REVISION_REQUIRED' ? 'badge-rose' : 'badge-amber'}`}>
                          {deliv.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                        {deliv.staging_url && (
                          <a href={deliv.staging_url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ExternalLink size={13} />
                            <span>Staging URL</span>
                          </a>
                        )}
                        {deliv.repo_url && (
                          <a href={deliv.repo_url} target="_blank" rel="noreferrer" style={{ color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Code size={13} />
                            <span>GitHub Repo</span>
                          </a>
                        )}
                      </div>

                      {deliv.notes && (
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Notes: {deliv.notes}
                        </p>
                      )}

                      {deliv.status === 'SUBMITTED' && (
                        <button
                          onClick={() => {
                            setSelectedDeliverable(deliv);
                            setReviewDeliverableModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Review & Approve / Request Revision
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Admin ↔ Engineer Communication Thread (Requirement 11) */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} color="#818cf8" />
                <span>Admin ↔ Engineer Internal Communication Thread</span>
              </h4>

              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                padding: '0.5rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)'
              }}>
                {activeProjectNotes.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>
                    No communication notes yet. Leave technical instructions or updates for the assigned engineer below.
                  </div>
                ) : (
                  activeProjectNotes.map(note => (
                    <div
                      key={note.id}
                      style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        background: note.author_role === 'ADMIN' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                        borderLeft: `3px solid ${note.author_role === 'ADMIN' ? '#f59e0b' : '#818cf8'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#fff' }}>{note.author_name} ({note.author_role})</strong>
                        <span>{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handlePostNote} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Post technical instruction or question for the engineer..."
                  value={newProjectNote}
                  onChange={(e) => setNewProjectNote(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.85rem' }}
                />
                <button type="submit" disabled={notePosting || !newProjectNote.trim()} className="btn btn-primary btn-sm">
                  <Send size={14} />
                  <span>Post</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TECHNICAL SCOPING MODAL (REQUIREMENT 6 & 8)                */}
      {/* ========================================================= */}
      {scopingModalOpen && (
        <div className="modal-overlay" onClick={() => setScopingModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(640px, 95vw)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Technical Scoping & Specifications
              </h3>
              <button onClick={() => setScopingModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveScope}>
              <div className="form-group">
                <label className="form-label">Instructions & Architecture Guidelines for Software Engineer *</label>
                <textarea
                  rows={4}
                  required
                  value={scopeAdminInstructions}
                  onChange={(e) => setScopeAdminInstructions(e.target.value)}
                  placeholder="Specify key technical stack, directory architecture, database entities, Paystack webhook requirements, and constraints..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Acceptance Criteria (Deliverable Definition of Done) *</label>
                <textarea
                  rows={3}
                  required
                  value={scopeAcceptanceCriteria}
                  onChange={(e) => setScopeAcceptanceCriteria(e.target.value)}
                  placeholder="e.g. 1. Deployed live on Vercel/Render, 2. Paystack transaction flow tested in test mode, 3. Responsive across mobile & desktop."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={scopePriority}
                    onChange={(e) => setScopePriority(e.target.value)}
                    className="form-select"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Deadline</label>
                  <input
                    type="date"
                    value={scopeInternalDeadline}
                    onChange={(e) => setScopeInternalDeadline(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Private Admin Notes</label>
                <textarea
                  rows={2}
                  value={scopeAdminNotes}
                  onChange={(e) => setScopeAdminNotes(e.target.value)}
                  placeholder="Internal notes for leadership team only..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={scopingLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {scopingLoading ? 'Saving...' : 'Save Technical Scope'}
                </button>
                <button type="button" onClick={() => setScopingModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ENGINEER ASSIGNMENT MODAL (REQUIREMENT 9)                  */}
      {/* ========================================================= */}
      {assignModalOpen && (
        <div className="modal-overlay" onClick={() => setAssignModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(600px, 95vw)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Assign Software Engineer
              </h3>
              <button onClick={() => setAssignModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignEngineer}>
              <div className="form-group">
                <label className="form-label">Select Software Engineer *</label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Unassign / Select Engineer --</option>
                  {engineers.map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.full_name} ({eng.skills || 'Generalist'}) — {eng.active_projects || 0} active projects
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Instructions</label>
                <textarea
                  rows={3}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="Key instructions, repositories to fork, or deadlines..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value)}
                    className="form-select"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Deadline</label>
                  <input
                    type="date"
                    value={assignDeadline}
                    onChange={(e) => setAssignDeadline(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={assignLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
                <button type="button" onClick={() => setAssignModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELIVERABLE REVIEW MODAL (REQUIREMENT 10 & 18)             */}
      {/* ========================================================= */}
      {reviewDeliverableModalOpen && selectedDeliverable && (
        <div className="modal-overlay" onClick={() => setReviewDeliverableModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(580px, 95vw)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Review Deliverable: {selectedDeliverable.title}
              </h3>
              <button onClick={() => setReviewDeliverableModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewDeliverable}>
              <div className="form-group">
                <label className="form-label">Review Decision *</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="APPROVED">APPROVED (Ready for client handoff)</option>
                  <option value="REVISION_REQUIRED">REVISION_REQUIRED (Send back to engineer with feedback)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Feedback for Software Engineer</label>
                <textarea
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder={reviewStatus === 'APPROVED' ? 'Optional commendations or release notes...' : 'Specify exactly what features need adjustment before approval...'}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className={`btn ${reviewStatus === 'APPROVED' ? 'btn-primary' : 'btn-danger'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {reviewLoading ? 'Submitting...' : reviewStatus === 'APPROVED' ? 'Approve Deliverable' : 'Request Revision'}
                </button>
                <button type="button" onClick={() => setReviewDeliverableModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MARK DELIVERED TO CLIENT MODAL                            */}
      {/* ========================================================= */}
      {deliverModalOpen && inspectProject && (
        <div className="modal-overlay" onClick={() => setDeliverModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(580px, 95vw)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                Deliver Project to Client
              </h3>
              <button onClick={() => setDeliverModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMarkDelivered}>
              <div className="form-group">
                <label className="form-label">Live Production URL for Client *</label>
                <input
                  type="url"
                  required
                  value={deliveryProductionUrl}
                  onChange={(e) => setDeliveryProductionUrl(e.target.value)}
                  placeholder="https://client-project.vercel.app or custom domain"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Notes / Handover Guidance</label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Instructions for client on accessing their live MVP, credentials, repository, or next steps..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={deliveringLoading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {deliveringLoading ? 'Delivering...' : 'Confirm Delivery to Client'}
                </button>
                <button type="button" onClick={() => setDeliverModalOpen(false)} className="btn btn-secondary">
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
