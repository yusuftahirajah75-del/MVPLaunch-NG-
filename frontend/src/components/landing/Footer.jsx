import React from 'react';
import { Rocket, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-base)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '4rem 0 2.5rem',
      fontSize: '0.9rem',
      color: 'var(--text-muted)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
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
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>MVPLaunch NG</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Turn your validated idea into a real MVP you can show people. Built for Nigerian founders, students, and businesses.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--accent-emerald-light)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
              <span>All Systems Operational in Nigeria</span>
            </div>
          </div>

          {/* Service Links */}
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Platform</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>7-Stage Launch Framework</a></li>
              <li><a href="#services" style={{ color: 'var(--text-secondary)' }}>MVP Build Sprint</a></li>
              <li><a href="#services" style={{ color: 'var(--text-secondary)' }}>Project Finish Sprint</a></li>
              <li><a href="#services" style={{ color: 'var(--text-secondary)' }}>Maintenance Retainers</a></li>
              <li><a href="/api-docs" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-emerald-light)' }}>Swagger API Documentation ↗</a></li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Guarantees</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>100% GitHub Code Transfer</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>Paystack Escrow Milestones</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>Zero Proprietary Lock-in</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>Confidential Scoping</span>
              </li>
            </ul>
          </div>

          {/* Location & Support */}
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Ecosystem</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.5rem' }}>
              Proudly supporting student innovators and founders across Lagos, Ibadan, Abuja, Enugu, and all Nigerian universities.
            </p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Inquiries: <strong style={{ color: '#fff' }}>hello@mvplaunch.ng</strong>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem'
        }}>
          <div>
            © {new Date().getFullYear()} MVPLaunch NG. Built with PostgreSQL, Express, React, and Paystack.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Crafted for Nigerian founders with</span>
            <Heart size={14} fill="#f43f5e" color="#f43f5e" />
          </div>
        </div>
      </div>
    </footer>
  );
}
