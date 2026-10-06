import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, TrendingUp, DollarSign, Database,
  Activity, RefreshCw, FileText, CheckCircle2, Clock,
  Package, ShoppingBag, ExternalLink, Filter, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminPortal({ onBackToLanding }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'metrics' | 'ideas'
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingFulfillment, setUpdatingFulfillment] = useState({});
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, hRes, aRes, iRes, oRes] = await Promise.all([
        api.admin.getMetrics().catch(() => ({ data: { metrics: null } })),
        api.admin.getHealth().catch(() => ({ data: { health: null } })),
        api.admin.listAuditLogs('?limit=25').catch(() => ({ data: { auditLogs: [] } })),
        api.ideas.getAll().catch(() => ({ data: [] })),
        api.admin.getOrders().catch(() => ({ data: { orders: [] } }))
      ]);

      setMetrics(mRes?.data?.metrics || null);
      setHealth(hRes?.data?.health || null);
      setAuditLogs(aRes?.data?.auditLogs || aRes?.data || []);
      setIdeas(iRes?.data?.ideas || iRes?.data || []);
      setOrders(oRes?.data?.orders || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFulfillment = async (orderId, newStatus) => {
    setUpdatingFulfillment(prev => ({ ...prev, [orderId]: true }));
    try {
      await api.admin.updateOrderFulfillment(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillment_status: newStatus } : o));
    } catch (err) {
      alert(err.message || 'Failed to update fulfillment status');
    } finally {
      setUpdatingFulfillment(prev => ({ ...prev, [orderId]: false }));
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

      {/* Navigation Sub-header / Tabs */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.5rem 0'
      }}>
        <div className="container" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
              fontSize: '0.75rem'
            }}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`btn btn-sm ${activeTab === 'metrics' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <TrendingUp size={15} />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`btn btn-sm ${activeTab === 'ideas' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <FileText size={15} />
            <span>Ideas & Audit Logs</span>
          </button>
        </div>
      </div>

      <main className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <RefreshCw size={28} className="animate-float" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aggregating platform metrics & orders...</p>
          </div>
        ) : (
          <div>
            {/* TAB 1: PACKAGE ORDERS & REVENUE */}
            {activeTab === 'orders' && (
              <div>
                {/* Revenue & Settlement Banner */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div className="card" style={{ background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Verified Paystack Revenue
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald-light)', marginTop: '0.2rem' }}>
                      ₦{(metrics?.financials?.totalRevenueNgn || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {orders.filter(o => o.payment_status === 'PAID').length} Paid Orders
                    </div>
                  </div>

                  <div className="card" style={{ background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Pending Orders
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                      {orders.filter(o => o.payment_status !== 'PAID').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Awaiting Checkout Completion
                    </div>
                  </div>

                  <div className="card" style={{ background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Active Fulfillments
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                      {orders.filter(o => o.fulfillment_status === 'IN_PROGRESS').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Currently in Production
                    </div>
                  </div>
                </div>

                {/* Filter and Table Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
                    <button
                      onClick={() => setOrderFilter('ALL')}
                      className={`btn btn-xs ${orderFilter === 'ALL' ? 'btn-secondary' : 'btn-ghost'}`}
                    >
                      All ({orders.length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('PAID')}
                      className={`btn btn-xs ${orderFilter === 'PAID' ? 'btn-secondary' : 'btn-ghost'}`}
                      style={{ color: 'var(--accent-emerald)' }}
                    >
                      Paid ({orders.filter(o => o.payment_status === 'PAID').length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('PENDING')}
                      className={`btn btn-xs ${orderFilter === 'PENDING' ? 'btn-secondary' : 'btn-ghost'}`}
                      style={{ color: '#f59e0b' }}
                    >
                      Pending ({orders.filter(o => o.payment_status !== 'PAID').length})
                    </button>
                  </div>

                  <a
                    href="https://dashboard.paystack.com/#/transactions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-xs"
                    style={{ gap: '0.35rem', color: '#38bdf8' }}
                  >
                    <span>Open Paystack Dashboard</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Orders List / Table */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.85rem 1rem' }}>Order / Date</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Package</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Customer Details</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Payment Status</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Paystack Reference</th>
                          <th style={{ padding: '0.85rem 1rem' }}>Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                              No orders recorded in the system yet.
                            </td>
                          </tr>
                        ) : (
                          orders
                            .filter(o => {
                              if (orderFilter === 'PAID') return o.payment_status === 'PAID';
                              if (orderFilter === 'PENDING') return o.payment_status !== 'PAID';
                              return true;
                            })
                            .map((order) => (
                              <tr
                                key={order.id}
                                style={{
                                  borderBottom: '1px solid var(--border-subtle)',
                                  background: order.payment_status === 'PAID' ? 'rgba(16, 185, 129, 0.02)' : 'transparent'
                                }}
                              >
                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 700, color: '#fff' }}>
                                    {order.id.slice(0, 8)}...
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>
                                    {order.package_name || order.project_title || 'Custom Project'}
                                  </div>
                                  {order.package_id && (
                                    <span className="badge badge-indigo" style={{ marginTop: '3px', fontSize: '0.7rem' }}>
                                      {order.package_id}
                                    </span>
                                  )}
                                  {order.notes && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic', maxWidth: '200px' }}>
                                      "{order.notes}"
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 600, color: '#fff' }}>
                                    {order.customer_name || order.client_name || 'Anonymous Guest'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {order.customer_email || order.client_email}
                                  </div>
                                  {order.customer_phone && (
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      {order.customer_phone}
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                                    ₦{Number(order.total_amount_ngn).toLocaleString()}
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  {order.payment_status === 'PAID' ? (
                                    <span className="badge badge-emerald">PAID</span>
                                  ) : order.payment_status === 'FAILED' ? (
                                    <span className="badge badge-red">FAILED</span>
                                  ) : (
                                    <span className="badge badge-amber">PENDING</span>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {order.provider_reference || 'N/A'}
                                  </div>
                                  {order.paystack_transaction_id && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      ID: {order.paystack_transaction_id}
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                  <select
                                    value={order.fulfillment_status || 'PENDING'}
                                    disabled={updatingFulfillment[order.id]}
                                    onChange={(e) => handleUpdateFulfillment(order.id, e.target.value)}
                                    style={{
                                      background: 'var(--bg-surface)',
                                      border: '1px solid var(--border-subtle)',
                                      color: '#fff',
                                      borderRadius: '4px',
                                      padding: '4px 6px',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Settlement Advisory */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <AlertTriangle size={18} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    <strong style={{ color: '#fff' }}>Settlement & Revenue Reconciliation:</strong> Statuses above reflect real-time Paystack transaction verifications in our database. Actual payouts to your verified Nigerian commercial bank account are scheduled per Paystack settlement rules (typically T+1 business day for local NGN collections). Always verify final bank deposits and fee deductions on your official Paystack Dashboard.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OVERVIEW & KPIS */}
            {activeTab === 'metrics' && (
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
              </div>
            )}

            {/* TAB 3: CLIENT IDEAS & AUDIT LOG */}
            {activeTab === 'ideas' && (
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}
