/**
 * MVPLaunch NG - Admin Dashboard Service
 */
const db = require('../../config/db');

class AdminService {
  async getDashboardMetrics() {
    const [
      usersCountRes,
      ideasCountRes,
      projectsCountRes,
      revenueRes,
      pendingProposalsRes,
      recentActivityRes
    ] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'CLIENT') as total_clients,
          COUNT(*) FILTER (WHERE role = 'DEVELOPER') as total_developers,
          COUNT(*) FILTER (WHERE is_active = TRUE) as active_users
        FROM users
      `),
      db.query(`
        SELECT 
          COUNT(*) as total_ideas,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED') as pending_ideas,
          COUNT(*) FILTER (WHERE status = 'CLARIFIED') as clarified_ideas
        FROM ideas
      `),
      db.query(`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(*) FILTER (WHERE status = 'IN_DEVELOPMENT') as in_dev_projects,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_projects,
          COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted_projects
        FROM projects
      `),
      db.query(`
        SELECT 
          COALESCE(SUM(amount_ngn) FILTER (WHERE status = 'VERIFIED'), 0) as total_revenue_ngn,
          COUNT(*) FILTER (WHERE status = 'VERIFIED') as verified_payments_count,
          COALESCE(SUM(amount_ngn) FILTER (WHERE status = 'INITIALIZED'), 0) as pending_revenue_ngn
        FROM payments
      `),
      db.query(`
        SELECT COUNT(*) as pending_proposals FROM proposals WHERE status = 'PENDING'
      `),
      db.query(`
        SELECT a.action, a.entity_type, a.entity_id, a.created_at, u.full_name as user_name
        FROM audit_logs a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
        LIMIT 10
      `)
    ]);

    return {
      users: {
        total: parseInt(usersCountRes.rows[0].total_users, 10),
        clients: parseInt(usersCountRes.rows[0].total_clients, 10),
        developers: parseInt(usersCountRes.rows[0].total_developers, 10),
        active: parseInt(usersCountRes.rows[0].active_users, 10)
      },
      ideas: {
        total: parseInt(ideasCountRes.rows[0].total_ideas, 10),
        pendingReview: parseInt(ideasCountRes.rows[0].pending_ideas, 10),
        clarified: parseInt(ideasCountRes.rows[0].clarified_ideas, 10)
      },
      projects: {
        total: parseInt(projectsCountRes.rows[0].total_projects, 10),
        inDevelopment: parseInt(projectsCountRes.rows[0].in_dev_projects, 10),
        accepted: parseInt(projectsCountRes.rows[0].accepted_projects, 10),
        completed: parseInt(projectsCountRes.rows[0].completed_projects, 10)
      },
      financials: {
        currency: 'NGN',
        totalRevenueNgn: parseFloat(revenueRes.rows[0].total_revenue_ngn),
        pendingRevenueNgn: parseFloat(revenueRes.rows[0].pending_revenue_ngn),
        successfulTransactions: parseInt(revenueRes.rows[0].verified_payments_count, 10)
      },
      pendingProposalsCount: parseInt(pendingProposalsRes.rows[0].pending_proposals, 10),
      recentActivity: recentActivityRes.rows
    };
  }

  async getSystemHealth() {
    const dbTest = await db.testConnection();
    return {
      status: dbTest.success ? 'HEALTHY' : 'DEGRADED',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      database: dbTest,
      memoryUsage: process.memoryUsage()
    };
  }
}

module.exports = new AdminService();
