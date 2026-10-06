import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote } from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { api } from '../../api/client';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await api.reviews.getPublic();
        if (res?.data) {
          setReviews(res.data);
        }
      } catch (err) {
        // Fallback gracefully
        console.error('Could not load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <section id="reviews" style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-surface)', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Verified Testimonials</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            Real Feedback from Builders Who Launched.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            We don’t fabricate fake customer logos or fake testimonials. These reviews are submitted directly by verified clients upon completed project delivery and GitHub repository handover.
          </p>
        </div>

        {/* Dynamic Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="card"
                style={{
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Verified Launch</span>
                  </div>

                  {rev.title && (
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
                      “{rev.title}”
                    </h3>
                  )}

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                    “{rev.feedback_text}”
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1rem'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--accent-emerald-dark)',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {rev.client_name ? rev.client_name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{rev.client_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project: {rev.project_title || 'MVP Launch'}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Genuine Early Adopter Spotlight Card */
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 2rem' }}>
              <Quote size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                Be one of our spotlight MVP builders
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                We partner closely with high-conviction Nigerian founders and students to build their core product. Start your project today and showcase your launch here.
              </p>
            </div>
          )}
        </div>

        {/* Genuine Trust Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '1.5rem',
          padding: 'clamp(1.25rem, 3.5vw, 2rem)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <GithubIcon size={24} color="#fff" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>Complete GitHub Handover</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>You receive full ownership of the clean git repository and deploy scripts.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <ShieldCheck size={24} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>Milestone-Guaranteed Escrow</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Payment slices are only approved and released when you verify each phase.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>Zero Proprietary Lock-In</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Standard Node.js and PostgreSQL. Any engineer in the world can build on top of it.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
