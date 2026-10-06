import React, { useState } from 'react';
import { X, Rocket, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function SubmitIdeaModal({ onIdeaSubmitted }) {
  const { ideaModalOpen, setIdeaModalOpen, user, openLogin } = useAuth();

  const [title, setTitle] = useState('');
  const [rawSummary, setRawSummary] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('E-commerce & Retail');
  const [budgetBracket, setBudgetBracket] = useState('₦500,000 - ₦1,000,000');
  const [targetTimeline, setTargetTimeline] = useState('3-4 Weeks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!ideaModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in or create an account to save your idea submission.');
      openLogin();
      return;
    }

    if (user.role !== 'CLIENT') {
      setError('Only client/founder accounts can submit project ideas.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.ideas.submit({
        title,
        rawSummary,
        targetIndustry,
        budgetBracket,
        targetTimeline
      });
      setSuccess(true);
      setTimeout(() => {
        setIdeaModalOpen(false);
        setSuccess(false);
        if (onIdeaSubmitted) onIdeaSubmitted(res.data.idea);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit idea. Please check the details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIdeaModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 'clamp(1.15rem, 4vw, 2rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#032014'
            }}>
              <Rocket size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>Start Your MVP Project</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Tell us about your product idea. We’ll help turn it into a clear plan.
              </p>
            </div>
          </div>
          <button onClick={() => setIdeaModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>Idea Submitted Successfully!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Redirecting you to your client project workspace...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                color: '#fda4af',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Project / Idea Title</label>
              <input
                type="text"
                required
                placeholder="e.g. QuickRetail NG or HostelFood Express"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">What problem are you solving and how?</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your idea in plain words: Who has the problem? What is painful about their current situation? What should your web MVP do for them?"
                value={rawSummary}
                onChange={(e) => setRawSummary(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Industry / Domain</label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="form-select"
                >
                  <option value="E-commerce & Retail">E-commerce & Retail</option>
                  <option value="Fintech & Payments">Fintech & Payments</option>
                  <option value="EdTech & Students">EdTech & Campus</option>
                  <option value="Logistics & Delivery">Logistics & Delivery</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Timeline</label>
                <select
                  value={targetTimeline}
                  onChange={(e) => setTargetTimeline(e.target.value)}
                  className="form-select"
                >
                  <option value="1-2 Weeks">1–2 Weeks (Fast Sprint)</option>
                  <option value="3-4 Weeks">3–4 Weeks (Standard MVP)</option>
                  <option value="5+ Weeks">5+ Weeks (Complex)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Budget Range</label>
              <select
                value={budgetBracket}
                onChange={(e) => setBudgetBracket(e.target.value)}
                className="form-select"
              >
                <option value="₦300,000 - ₦500,000">₦300,000 – ₦500,000 (Prototype Sprint)</option>
                <option value="₦500,000 - ₦1,000,000">₦500,000 – ₦1,000,000 (Complete Web MVP)</option>
                <option value="₦1,000,000+">₦1,000,000+ (Multi-Integration System)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            >
              <span>{loading ? 'Submitting Idea...' : 'Submit Idea for Technical Scoping'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
