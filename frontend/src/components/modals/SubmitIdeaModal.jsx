import React, { useState, useEffect } from 'react';
import {
  X, Rocket, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  ShieldCheck, CreditCard, Clock, FileText, ChevronDown, Search,
  ExternalLink, Lock, HelpCircle, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import PackageCheckoutModal from './PackageCheckoutModal';
import { LAUNCH_PACKAGES } from '../landing/PackagesSection';

export const INDUSTRIES_LIST = [
  'EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-commerce', 'SaaS',
  'Cybersecurity', 'AI / Machine Learning', 'AI Agents / Automation', 'Web3 / Blockchain',
  'GovTech', 'LegalTech', 'PropTech / Real Estate', 'InsurTech', 'Logistics / Delivery',
  'Transportation / Mobility', 'TravelTech', 'FoodTech', 'RetailTech', 'FashionTech',
  'SportsTech', 'MediaTech', 'EntertainmentTech', 'Social / Community', 'HRTech / Recruitment',
  'CareerTech', 'Creator Economy', 'MarketingTech', 'AdTech', 'ClimateTech / CleanTech',
  'EnergyTech', 'ConstructionTech', 'ManufacturingTech', 'IndustrialTech', 'BeautyTech',
  'FitnessTech', 'EventTech', 'HospitalityTech', 'Nonprofit / NGO',
  'Religious / Community Services', 'Student / Campus Solutions', 'Productivity / Collaboration',
  'Developer Tools', 'B2B / Enterprise', 'Marketplace', 'Booking / Reservation',
  'FinOps / Accounting', 'Real Estate', 'Security / Trust & Verification', 'Other / Custom'
];

export default function SubmitIdeaModal({ onIdeaSubmitted, initialOrderId = null, initialPaymentRef = null }) {
  const { ideaModalOpen, setIdeaModalOpen, user, openLogin } = useAuth();

  // Paid orders tracking
  const [paidOrders, setPaidOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [packageForCheckout, setPackageForCheckout] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('FinTech');
  const [customIndustry, setCustomIndustry] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const [problemStatement, setProblemStatement] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [coreFeatures, setCoreFeatures] = useState('');
  const [niceToHaveFeatures, setNiceToHaveFeatures] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [existingProductUrl, setExistingProductUrl] = useState('');
  const [competitorReferences, setCompetitorReferences] = useState('');
  const [designPreferences, setDesignPreferences] = useState('');
  const [technicalRequirements, setTechnicalRequirements] = useState('');
  const [preferredDeadline, setPreferredDeadline] = useState('3-4 Weeks');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedProject, setSubmittedProject] = useState(null);

  // Sync user profile when modal opens
  useEffect(() => {
    if (user && ideaModalOpen) {
      setClientName(user.full_name || '');
      setClientEmail(user.email || '');
      setClientPhone(user.phone_number || '');
      fetchPaidOrders();
    }
  }, [user, ideaModalOpen]);

  const fetchPaidOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.orders.list('?limit=20');
      const orders = res?.data?.orders || [];
      // Filter orders that are verified/paid
      const verified = orders.filter(o => o.payment_status === 'PAID');
      setPaidOrders(verified);

      if (initialOrderId) {
        const found = verified.find(o => o.id === initialOrderId);
        if (found) setSelectedOrder(found);
      } else if (initialPaymentRef) {
        const found = verified.find(o => o.paystack_reference === initialPaymentRef);
        if (found) setSelectedOrder(found);
      } else if (verified.length > 0) {
        // Pre-select the latest unsubmitted order, or the latest order
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
    setPackageForCheckout(pkg);
    setCheckoutModalOpen(true);
  };

  const filteredIndustries = INDUSTRIES_LIST.filter(ind =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in or create an account to submit your project.');
      openLogin();
      return;
    }

    if (!selectedOrder) {
      setError('Payment verification is required before submitting project details. Please select a package and complete payment first.');
      return;
    }

    if (industry === 'Other / Custom' && !customIndustry.trim()) {
      setError('Please specify your custom industry/domain.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: selectedOrder.id,
        paymentReference: selectedOrder.paystack_reference || null,
        title: title.trim(),
        organizationName: organizationName.trim() || null,
        industry: industry === 'Other / Custom' ? customIndustry.trim() : industry,
        problemStatement: problemStatement.trim(),
        targetUsers: targetUsers.trim(),
        proposedSolution: proposedSolution.trim(),
        coreFeatures: coreFeatures.trim(),
        niceToHaveFeatures: niceToHaveFeatures.trim() || null,
        expectedOutcome: expectedOutcome.trim() || null,
        existingProductUrl: existingProductUrl.trim() || null,
        competitorReferences: competitorReferences.trim() || null,
        designPreferences: designPreferences.trim() || null,
        technicalRequirements: technicalRequirements.trim() || null,
        preferredDeadline: preferredDeadline || null,
        selectedPackageId: selectedOrder.package_id || null,
        selectedPackageName: selectedOrder.package_name || null,
        attachmentUrl: attachmentUrl.trim() || null,
        additionalNotes: additionalNotes.trim() || null
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
            width: 'min(780px, calc(100vw - 1.5rem))',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto',
            padding: 'clamp(1.25rem, 4vw, 2.25rem)',
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
                width: '38px',
                height: '38px',
                borderRadius: '10px',
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
                <h3 style={{ fontSize: '1.45rem', color: '#fff', margin: 0 }}>Start Your MVP Project</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Transparent Launch Packages for Nigeria • Verified Payment Gating
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
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px solid var(--accent-emerald)'
              }}>
                <CheckCircle2 size={42} color="var(--accent-emerald)" />
              </div>

              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                Project Brief Submitted & Scoping Initiated
              </span>

              <h3 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>
                {submittedProject.title}
              </h3>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                margin: '1.5rem auto',
                maxWidth: '480px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Project Tracking ID</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem' }}>
                    {submittedProject.project_code || submittedProject.id}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Industry / Domain</span>
                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>{submittedProject.industry}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Package</span>
                  <span style={{ color: 'var(--accent-emerald-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {submittedProject.selected_package_name || selectedOrder?.package_name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</span>
                  <span className="badge badge-blue">SUBMITTED (Under Admin Scoping)</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                Our Platform Director is reviewing your technical specifications. An engineer will be assigned and development will start immediately. Track all progress in your Client Workspace.
              </p>

              <button
                onClick={() => {
                  setIdeaModalOpen(false);
                  setSubmittedProject(null);
                  window.location.hash = 'client';
                  window.location.reload();
                }}
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', fontWeight: 700 }}
              >
                <span>Go to Client Workspace & Track Progress</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div>
              {/* Not Authenticated Warning */}
              {!user && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Lock size={20} color="#818cf8" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Account Required to Start Project</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sign in or register to secure your verified payment and project deliverables.</div>
                    </div>
                  </div>
                  <button onClick={openLogin} className="btn btn-primary btn-sm">
                    Sign In / Register
                  </button>
                </div>
              )}

              {/* STEP 1: PAYMENT ENFORCEMENT & VERIFICATION */}
              {user && paidOrders.length === 0 && !ordersLoading && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.07)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                    <AlertCircle size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ color: '#fbbf24', fontSize: '1.05rem', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                        Step 1: Choose Package & Complete Verified Payment
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                        To guarantee engineer availability and prompt technical scoping, project briefs are unlocked after completing verified payment for an official MVPLaunch NG launch package.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                    color: '#a7f3d0'
                  }}>
                    💡 <strong>Starting Prices:</strong> Package prices are starting prices for standard scopes. Deliverables, estimated timelines, and revision terms are strictly guaranteed.
                  </div>

                  {/* 4 Packages Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {LAUNCH_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: pkg.popular ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span className={`badge ${pkg.badgeClass}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                              {pkg.badge}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pkg.timeline}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>
                            {pkg.name}
                          </div>
                          <div style={{ color: 'var(--accent-emerald-light)', fontSize: '1.15rem', fontWeight: 800 }}>
                            ₦{pkg.priceNgn.toLocaleString()}+
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', lineHeight: '1.4' }}>
                            {pkg.deliverable}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectPackageForPayment(pkg)}
                          className={`btn ${pkg.popular ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                          <CreditCard size={14} />
                          <span>Select & Pay via Paystack</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: VERIFIED PAYMENT UNLOCKED PROJECT FORM */}
              {user && (paidOrders.length > 0 || selectedOrder) && (
                <form onSubmit={handleSubmit}>
                  {/* Verified Order Banner */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <ShieldCheck size={22} color="var(--accent-emerald)" />
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>
                          Verified Paid Package Order
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                          {selectedOrder?.package_name || 'Transparent Launch Package'} — ₦{selectedOrder?.total_amount_ngn?.toLocaleString()} NGN
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          Ref: {selectedOrder?.paystack_reference || selectedOrder?.id}
                        </div>
                      </div>
                    </div>

                    {paidOrders.length > 1 && (
                      <select
                        value={selectedOrder?.id || ''}
                        onChange={(e) => {
                          const order = paidOrders.find(o => o.id === e.target.value);
                          if (order) setSelectedOrder(order);
                        }}
                        className="form-select"
                        style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                      >
                        {paidOrders.map(o => (
                          <option key={o.id} value={o.id}>
                            Order {o.id.substring(0, 8)}... ({o.package_name})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {error && (
                    <div style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      color: '#fda4af',
                      fontSize: '0.85rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Section A: Client & Business Contact Details */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>1.</span> Contact & Business Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Client Name *</label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Chioma Adeleke"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="chioma@example.com"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">WhatsApp Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+234 814 555 6677"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Organization / Business Name (Optional)</label>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="QuickRetail Nigeria Ltd"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Industry/Domain Selection (50+ searchable categories) */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>2.</span> Industry & Domain Category *
                    </h4>

                    <div style={{ position: 'relative' }}>
                      <div
                        onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                        className="form-input"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ color: '#fff', fontWeight: 600 }}>{industry}</span>
                        <ChevronDown size={16} color="var(--text-muted)" />
                      </div>

                      {showIndustryDropdown && (
                        <div style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          maxHeight: '260px',
                          overflowY: 'auto',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-xl)',
                          zIndex: 50,
                          padding: '0.5rem'
                        }}>
                          {/* Search bar inside dropdown */}
                          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                            <input
                              type="text"
                              placeholder="Search 50+ industries (e.g. FinTech, AgriTech, AI)..."
                              value={industrySearch}
                              onChange={(e) => setIndustrySearch(e.target.value)}
                              className="form-input"
                              style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '4px' }}>
                            {filteredIndustries.map((ind) => (
                              <button
                                key={ind}
                                type="button"
                                onClick={() => {
                                  setIndustry(ind);
                                  setShowIndustryDropdown(false);
                                  setIndustrySearch('');
                                }}
                                style={{
                                  textAlign: 'left',
                                  padding: '0.45rem 0.6rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  color: industry === ind ? 'var(--accent-emerald-light)' : '#e2e8f0',
                                  background: industry === ind ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = industry === ind ? 'rgba(16, 185, 129, 0.15)' : 'transparent')}
                              >
                                {ind}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {industry === 'Other / Custom' && (
                      <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">Specify Your Custom Domain / Field *</label>
                        <input
                          type="text"
                          required
                          value={customIndustry}
                          onChange={(e) => setCustomIndustry(e.target.value)}
                          placeholder="e.g. Maritime Cargo Inspection, Campus Hostel Booking"
                          className="form-input"
                        />
                      </div>
                    )}
                  </div>

                  {/* Section C: Project Definition */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>3.</span> Project / Idea Definition
                    </h4>

                    <div className="form-group">
                      <label className="form-label">Project / Product Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. AgriVerify NG or CampusBite Express"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Problem Being Solved *</label>
                      <textarea
                        required
                        rows={3}
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                        placeholder="What specific pain point do Nigerian customers or businesses face today? Why is existing software or manual methods inadequate?"
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target Users & Audience *</label>
                      <input
                        type="text"
                        required
                        value={targetUsers}
                        onChange={(e) => setTargetUsers(e.target.value)}
                        placeholder="e.g. Nigerian university undergraduates, small boutique shop owners on Instagram"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Proposed Solution *</label>
                      <textarea
                        required
                        rows={3}
                        value={proposedSolution}
                        onChange={(e) => setProposedSolution(e.target.value)}
                        placeholder="How does your web application solve the problem? What is the user experience from landing to successful result?"
                        className="form-textarea"
                      />
                    </div>
                  </div>

                  {/* Section D: Features & Technical Scope */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>4.</span> Core MVP Features & Scope
                    </h4>

                    <div className="form-group">
                      <label className="form-label">Core MVP Features (Must-Haves for Launch) *</label>
                      <textarea
                        required
                        rows={4}
                        value={coreFeatures}
                        onChange={(e) => setCoreFeatures(e.target.value)}
                        placeholder="Enter 1 feature per line. Example:&#10;• User registration with WhatsApp phone number&#10;• Searchable product catalog&#10;• Paystack checkout integration&#10;• Admin order dispatch dashboard"
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nice-to-Have Features (Phase 2 / Post-Launch)</label>
                      <textarea
                        rows={2}
                        value={niceToHaveFeatures}
                        onChange={(e) => setNiceToHaveFeatures(e.target.value)}
                        placeholder="Features to add later (e.g. mobile push notifications, loyalty points)"
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expected MVP Outcome</label>
                      <input
                        type="text"
                        value={expectedOutcome}
                        onChange={(e) => setExpectedOutcome(e.target.value)}
                        placeholder="e.g. Acquire first 50 paying customers; Present in academic faculty defense"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Section E: Design Preferences & References */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>5.</span> References, Design & Specifications
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Existing Website / Prototype URL (If Any)</label>
                        <input
                          type="url"
                          value={existingProductUrl}
                          onChange={(e) => setExistingProductUrl(e.target.value)}
                          placeholder="https://mycurrentsite.com"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Competitor References / Inspiration</label>
                        <input
                          type="text"
                          value={competitorReferences}
                          onChange={(e) => setCompetitorReferences(e.target.value)}
                          placeholder="e.g. Moniepoint, Piggyvest, Flutterwave style"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Design & Styling Preferences</label>
                        <input
                          type="text"
                          value={designPreferences}
                          onChange={(e) => setDesignPreferences(e.target.value)}
                          placeholder="e.g. Dark mode, clean minimalist typography, high contrast"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Technical / Integration Requirements</label>
                        <input
                          type="text"
                          value={technicalRequirements}
                          onChange={(e) => setTechnicalRequirements(e.target.value)}
                          placeholder="e.g. Paystack, PostgreSQL, React, SendGrid"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Preferred Delivery Timeline</label>
                        <select
                          value={preferredDeadline}
                          onChange={(e) => setPreferredDeadline(e.target.value)}
                          className="form-select"
                        >
                          <option value="1-2 Weeks">1–2 Weeks (Fast Sprint)</option>
                          <option value="3-4 Weeks">3–4 Weeks (Standard Scope)</option>
                          <option value="5+ Weeks">5+ Weeks (Comprehensive)</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Document / Figma / Drive Attachment Link</label>
                        <input
                          type="url"
                          value={attachmentUrl}
                          onChange={(e) => setAttachmentUrl(e.target.value)}
                          placeholder="https://drive.google.com/... or Figma link"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label">Additional Instructions / Notes</label>
                      <textarea
                        rows={2}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Any special constraints, domain preferences, or context for the assigned engineer..."
                        className="form-textarea"
                      />
                    </div>
                  </div>

                  {/* Submission Button */}
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', fontWeight: 700, justifyContent: 'center' }}
                    >
                      <span>{loading ? 'Submitting Project Brief...' : 'Submit Project Brief for Technical Scoping'}</span>
                      <ArrowRight size={18} />
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Submitting locks this order to your project and generates your unique Project Code (PRJ-XXXX).
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Package Checkout Modal Triggered Directly if client chooses to buy */}
      {checkoutModalOpen && (
        <PackageCheckoutModal
          packageData={packageForCheckout}
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
        />
      )}
    </>
  );
}
