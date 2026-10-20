import React, { useState, useEffect } from 'react';
import {
  X, Rocket, CheckCircle2, AlertCircle, ArrowRight,
  ShieldCheck, CreditCard, Clock, FileText, ChevronDown, ChevronUp,
  Layers, User, Mail, Phone, ExternalLink, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import PackageCheckoutModal from './PackageCheckoutModal';
import { LAUNCH_PACKAGES } from '../landing/PackagesSection';

export const CLIENT_FRIENDLY_INDUSTRIES = [
  'Retail & E-commerce',
  'FinTech & Payments',
  'Education & Campus Solutions',
  'Health & Wellness',
  'Agriculture & Food',
  'Logistics & Transportation',
  'Real Estate & Housing',
  'Business & Professional Services',
  'Creator Economy & Media',
  'Social & Community',
  'Student Portfolio / Final Year Project',
  'Other / Custom Idea'
];

export default function SubmitIdeaModal({ onIdeaSubmitted, initialOrderId = null, initialPaymentRef = null }) {
  const { ideaModalOpen, setIdeaModalOpen, user, openLogin, selectedPackage, setSelectedPackage } = useAuth();

  // Paid orders tracking
  const [paidOrders, setPaidOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [packageForCheckout, setPackageForCheckout] = useState(null);

  // Sync selected package from AuthContext if available
  useEffect(() => {
    if (selectedPackage && !packageForCheckout) {
      setPackageForCheckout(selectedPackage);
    }
  }, [selectedPackage]);

  // Essential Plain-Language Form Fields
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('Retail & E-commerce');
  const [customIndustry, setCustomIndustry] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [coreFeatures, setCoreFeatures] = useState('');

  // Auto-filled Contact Details (from user/order)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Optional Secondary Details (Hidden behind collapsible toggle)
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [competitorReferences, setCompetitorReferences] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedProject, setSubmittedProject] = useState(null);

  // Sync user profile when modal opens
  useEffect(() => {
    if (user && ideaModalOpen) {
      setContactName(user.full_name || '');
      setContactEmail(user.email || '');
      setContactPhone(user.phone_number || '');
      fetchPaidOrders();
    }
  }, [user, ideaModalOpen]);

  const fetchPaidOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.orders.list('?limit=20');
      const orders = Array.isArray(res?.data) ? res.data : (res?.data?.orders || res?.orders || []);
      const verified = orders.filter(o => o.payment_status === 'PAID');
      setPaidOrders(verified);

      if (initialOrderId) {
        const found = verified.find(o => o.id === initialOrderId);
        if (found) setSelectedOrder(found);
      } else if (initialPaymentRef) {
        const found = verified.find(o => o.paystack_reference === initialPaymentRef);
        if (found) setSelectedOrder(found);
      } else if (verified.length > 0) {
        const unsubmitted = verified.find(o => !o.project_submitted);
        setSelectedOrder(unsubmitted || verified[0]);
      }
    } catch (err) {
      console.warn('Could not fetch client orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!ideaModalOpen) return null;

  const handleSelectPackageForPayment = (pkg) => {
    if (setSelectedPackage) setSelectedPackage(pkg);
    setPackageForCheckout(pkg);
    if (!user) {
      openLogin('start-mvp');
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in or create an account to submit your project.');
      openLogin('start-mvp');
      return;
    }

    if (!selectedOrder) {
      setError('A verified, paid package order is required before submitting project details. Please select a package and complete payment first.');
      return;
    }

    if (industry === 'Other / Custom Idea' && !customIndustry.trim()) {
      setError('Please specify your custom industry or project category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: selectedOrder.id,
        paymentReference: selectedOrder.paystack_reference || null,
        title: title.trim(),
        organizationName: organizationName.trim() || null,
        industry: industry === 'Other / Custom Idea' ? customIndustry.trim() : industry,
        problemStatement: problemStatement.trim(),
        targetUsers: targetUsers.trim(),
        proposedSolution: proposedSolution.trim(),
        coreFeatures: coreFeatures.trim(),
        additionalNotes: additionalNotes.trim() || null,
        competitorReferences: competitorReferences.trim() || null,
        selectedPackageId: selectedOrder.package_id || null,
        selectedPackageName: selectedOrder.package_name || null,
        clientContactName: contactName.trim() || user.full_name || null,
        clientContactEmail: contactEmail.trim().toLowerCase() || user.email || null,
        clientContactPhone: contactPhone.trim() || user.phone_number || null
      };

      const res = await api.projects.submit(payload);
      const created = res.data.project;
      setSubmittedProject(created);

      if (onIdeaSubmitted) onIdeaSubmitted(created);
    } catch (err) {
      setError(err.message || 'Failed to submit project. Please verify all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={() => setIdeaModalOpen(false)} style={{ zIndex: 1050 }}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(720px, calc(100vw - 1.5rem))',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto',
            padding: 'clamp(1.25rem, 4vw, 2rem)',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#032014',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}>
                <Rocket size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                  Start Your MVP Project
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
                  Tell us what you want to build in plain English — no technical jargon required.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIdeaModalOpen(false)}
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Submission Success View */}
          {submittedProject ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px solid var(--accent-emerald)'
              }}>
                <CheckCircle2 size={40} color="var(--accent-emerald)" />
              </div>

              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                Project Brief Submitted Successfully
              </span>

              <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem' }}>
                {submittedProject.title}
              </h3>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                margin: '1.5rem auto',
                maxWidth: '460px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Project Tracking ID</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem' }}>
                    {submittedProject.project_code || submittedProject.id}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Industry</span>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>{submittedProject.industry}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Selected Package</span>
                  <span style={{ color: 'var(--accent-emerald-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {submittedProject.selected_package_name || selectedOrder?.package_name || 'Launch Package'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</span>
                  <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                    {submittedProject.status}
                  </span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                🎉 Your project brief is registered! Our Platform Admin will review your answers, prepare technical scoping, and assign your vetted developer within <strong>24 hours</strong>.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setIdeaModalOpen(false);
                    setSubmittedProject(null);
                    window.location.href = '/portal/client';
                  }}
                  className="btn btn-primary"
                >
                  <span>Go to My Client Portal</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    setIdeaModalOpen(false);
                    setSubmittedProject(null);
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Error Alert */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  color: '#f87171',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Paid Package Status Card (Verified Payment Gating) */}
              {ordersLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Checking your verified package orders...
                </div>
              ) : paidOrders.length === 0 ? (
                /* No Paid Orders: Require Package Purchase First */
                <div style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={20} />
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Payment Required Before Project Submission</strong>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto 1.25rem', lineHeight: '1.5' }}>
                    To ensure dedicated engineering capacity and guaranteed delivery, MVPLaunch NG requires a confirmed launch package before technical scoping starts.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem',
                    textAlign: 'left',
                    marginBottom: '1.25rem'
                  }}>
                    {LAUNCH_PACKAGES.map(pkg => (
                      <div
                        key={pkg.id}
                        onClick={() => handleSelectPackageForPayment(pkg)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s ease, transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-emerald)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {pkg.badge}
                        </div>
                        <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block', margin: '0.2rem 0' }}>
                          {pkg.name}
                        </strong>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
                          ₦{pkg.priceNgn.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Timeline: {pkg.timeline}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    🔒 Payments processed securely via Paystack (Cards, Bank Transfer, USSD).
                  </div>
                </div>
              ) : (
                /* Verified Paid Order Found: Auto-populated banner */
                <div style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-emerald)'
                    }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                          ✓ Payment Verified
                        </span>
                        <strong style={{ fontSize: '0.98rem', color: '#fff' }}>
                          {selectedOrder?.package_name || 'Launch Package'}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Paid <strong>₦{(selectedOrder?.total_amount_ngn || 0).toLocaleString()}</strong> • Ref: <span style={{ fontFamily: 'monospace' }}>{selectedOrder?.paystack_reference || selectedOrder?.id?.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  {paidOrders.length > 1 && (
                    <select
                      value={selectedOrder?.id || ''}
                      onChange={(e) => {
                        const found = paidOrders.find(o => o.id === e.target.value);
                        if (found) setSelectedOrder(found);
                      }}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: 'auto' }}
                    >
                      {paidOrders.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.package_name} (₦{Number(o.total_amount_ngn).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* 2. Simplified Project Brief Form */}
              {paidOrders.length > 0 && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Field 1: Project Title */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      1. Project or Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. QuickRetail POS, EduTrack, FarmDirect"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.95rem' }}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      A clear working title for your product or venture.
                    </span>
                  </div>

                  {/* Field 2: Industry / Category */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      2. Industry or Business Category *
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.92rem' }}
                    >
                      {CLIENT_FRIENDLY_INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>

                    {industry === 'Other / Custom Idea' && (
                      <input
                        type="text"
                        required
                        placeholder="Please specify your project category..."
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        className="form-input"
                        style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                      />
                    )}
                  </div>

                  {/* Field 3: Problem Statement */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      3. What problem does this solve for your customers? *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Retail shop owners in Lagos lose track of cash transactions and daily inventory because manual paper bookkeeping is slow and creates errors."
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      className="form-textarea"
                      style={{ fontSize: '0.92rem', lineHeight: '1.5' }}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Explain in 2–3 simple sentences what frustrates your users today.
                    </span>
                  </div>

                  {/* Field 4: Target Users */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      4. Who will use this product? *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Small retail shop owners, store cashiers, and supermarket managers in Nigeria"
                      value={targetUsers}
                      onChange={(e) => setTargetUsers(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.92rem' }}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Who is your ideal customer or target audience?
                    </span>
                  </div>

                  {/* Field 5: Proposed Idea / Solution */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      5. How will your product solve this problem? *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. A fast, mobile-friendly web app where cashiers record sales in 5 seconds and business owners view live daily sales and inventory from their smartphones."
                      value={proposedSolution}
                      onChange={(e) => setProposedSolution(e.target.value)}
                      className="form-textarea"
                      style={{ fontSize: '0.92rem', lineHeight: '1.5' }}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Describe what the product will actually do from the customer's point of view.
                    </span>
                  </div>

                  {/* Field 6: Must-Have Features */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      6. Top 2 to 5 Essential Features Needed for Launch *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={"1. Quick barcode or item sale checkout\n2. Real-time stock inventory tracker\n3. Daily sales profit dashboard\n4. WhatsApp digital receipt generator"}
                      value={coreFeatures}
                      onChange={(e) => setCoreFeatures(e.target.value)}
                      className="form-textarea"
                      style={{ fontSize: '0.92rem', lineHeight: '1.5' }}
                    />
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      List only what is strictly necessary to launch. Enter one feature per line or comma-separated.
                    </span>
                  </div>

                  {/* Field 7: Pre-filled Contact Information */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.86rem', padding: '0.45rem 0.65rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.86rem', padding: '0.45rem 0.65rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 08012345678"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.86rem', padding: '0.45rem 0.65rem' }}
                      />
                    </div>
                  </div>

                  {/* Collapsible Section for Secondary / Optional Details */}
                  <div style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={15} color="var(--accent-emerald)" />
                        <span>Optional Details & Reference Links (Can be added later)</span>
                      </span>
                      {showOptionalFields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showOptionalFields && (
                      <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.82rem' }}>Company or Organization Name (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. QuickRetail Technologies Ltd"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.86rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.82rem' }}>Competitor Reference or Inspiration URL (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. https://example-app.com or similar product"
                            value={competitorReferences}
                            onChange={(e) => setCompetitorReferences(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.86rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.82rem' }}>Additional Notes or Specific Preferences (Optional)</label>
                          <textarea
                            rows={2}
                            placeholder="Any specific design colors, sample accounts, or notes for our engineers..."
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            className="form-textarea"
                            style={{ fontSize: '0.86rem' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Submit Action */}
                  <button
                    type="submit"
                    disabled={loading || !title.trim() || !problemStatement.trim() || !proposedSolution.trim()}
                    className="btn btn-primary"
                    style={{
                      padding: '0.95rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    {loading ? (
                      <span>Saving Project Brief...</span>
                    ) : (
                      <>
                        <span>Submit Project Brief & Start Development</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    🔒 Gated by verified payment • A dedicated engineer is assigned within 24 hours of brief submission.
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Package Checkout Modal if user needs to pay first */}
      {checkoutModalOpen && packageForCheckout && (
        <PackageCheckoutModal
          packageData={packageForCheckout}
          isOpen={checkoutModalOpen}
          onClose={() => {
            setCheckoutModalOpen(false);
            fetchPaidOrders();
          }}
        />
      )}
    </>
  );
}
