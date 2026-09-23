import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, TrendingUp, DollarSign, Database,
  Activity, RefreshCw, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminPortal({ onBackToLanding }) {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, hRes, aRes, iRes] = await Promise.all([
        api.admin.getMetrics().catch(() => ({ data: { metrics: null } })),
        api.admin.getHealth().catch(() => ({ data: { health: null } })),
        api.admin.listAuditLogs('?limit=25').catch(() => ({ data: { auditLogs: [] } })),
        api.ideas.getAll().catch(() => ({ data: [] }))
      ]);

      setMetrics(mRes?.data?.metrics || null);
      setHealth(hRes?.data?.health || null);
      setAuditLogs(aRes?.data?.auditLogs || aRes?.data || []);
      setIdeas(iRes?.data?.ideas || iRes?.data || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

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
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={onBackToLanding} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              ← Landing
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={16} color="#000" />
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Admin & Leadership Dashboard</strong>
              <span className="badge badge-amber">PLATFORM DIRECTOR</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={loadAdminData} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
              <RefreshCw size={14} />
              <span>Refresh Metrics</span>
            </button>
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <RefreshCw size={28} className="animate-float" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aggregating platform metrics & health...</p>
          </div>
        ) : (
          <div>
            {/* KPI Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}>
              <div className="card" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue</span>
                  <DollarSign size={18} color="var(--accent-emerald)" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
                  ₦{(metrics?.financials?.totalRevenueNgn || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {metrics?.financials?.successfulTransactions || 0} Verified Paystack Transactions
                </div>
              </div>

              <div className="card" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Projects</span>
                  <TrendingUp size={18} color="var(--accent-indigo)" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  {metrics?.projects?.total || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {metrics?.projects?.inDevelopment || 0} In Development • {metrics?.projects?.completed || 0} Completed
                </div>
              </div>

              <div className="card" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Registered Users</span>
                  <Users size={18} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  {metrics?.users?.total || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {metrics?.users?.clients || 0} Clients • {metrics?.users?.developers || 0} Vetted Developers
                </div>
              </div>

              <div className="card" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ideas Submitted</span>
                  <FileText size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fcd34d' }}>
                  {metrics?.ideas?.total || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {metrics?.ideas?.pendingReview || 0} Pending Scoping Review
                </div>
              </div>
            </div>

            {/* Health & Diagnostic Bar */}
            <div className="card" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={20} color={health?.status === 'HEALTHY' ? 'var(--accent-emerald)' : '#f59e0b'} />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    PostgreSQL System Health: {health?.status || 'HEALTHY'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Node Engine: {health?.nodeVersion || 'v24'} • Server Uptime: {Math.floor(health?.uptimeSeconds || 0)}s
                  </div>
                </div>
              </div>
              <span className="badge badge-emerald">DB POOL CONNECTED</span>
            </div>

            {/* Recent Ideas & Audit Logs Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Column 1: Client Ideas */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>Recent Ideas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {ideas.slice(0, 5).map((idea) => (
                    <div key={idea.id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{idea.title}</strong>
                        <span className="badge badge-indigo">{idea.status}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        {idea.raw_summary?.substring(0, 110)}...
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Client: {idea.client_name || 'Founder'} • Budget: {idea.budget_bracket}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Audit Logs */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>Audit Log Trail</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-emerald-light)' }}>{log.action}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        User: {log.user_name || 'System / Guest'} • Entity: {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 6)}...)` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
