/**
 * MVPLaunch NG - Admin Dashboard Service
 * Production metrics, orders inspection, engineer workloads & business intelligence
 */
const db = require('../../config/db');

class AdminService {
  async getDashboardMetrics() {
    const [
      usersCountRes,
      ordersCountRes,
      projectsCountRes,
      revenueRes,
      packageRevenueRes,
      engineersWorkloadRes,
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
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE payment_status = 'PAID') as paid_orders,
          COUNT(*) FILTER (WHERE payment_status IN ('PENDING', 'INITIALIZED')) as pending_orders,
          COUNT(*) FILTER (WHERE project_submitted = TRUE) as submitted_projects_count
        FROM orders
      `),
      db.query(`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED') as new_submissions,
          COUNT(*) FILTER (WHERE status = 'ADMIN_SCOPING') as in_scoping,
          COUNT(*) FILTER (WHERE status IN ('AWAITING_ENGINEER', 'SUBMITTED', 'ADMIN_SCOPING') AND developer_id IS NULL) as awaiting_assignment,
          COUNT(*) FILTER (WHERE status = 'ENGINEER_ASSIGNED') as assigned_projects,
          COUNT(*) FILTER (WHERE status IN ('ACCEPTED', 'IN_DEVELOPMENT')) as in_development,
          COUNT(*) FILTER (WHERE status = 'INTERNAL_REVIEW') as awaiting_review,
          COUNT(*) FILTER (WHERE status = 'REVISION_REQUIRED') as in_revision,
          COUNT(*) FILTER (WHERE status IN ('APPROVED', 'DELIVERED', 'COMPLETED')) as completed_projects
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
        SELECT 
          package_name,
          package_id,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount_ngn) FILTER (WHERE payment_status = 'PAID'), 0) as total_revenue
        FROM orders
        WHERE package_name IS NOT NULL
        GROUP BY package_name, package_id
        ORDER BY total_revenue DESC
      `),
      db.query(`
        SELECT 
          u.id, u.full_name, u.email, u.skills, u.availability_status,
          COUNT(p.id) FILTER (WHERE p.status IN ('ENGINEER_ASSIGNED', 'ACCEPTED', 'IN_DEVELOPMENT', 'INTERNAL_REVIEW', 'REVISION_REQUIRED')) as active_tasks,
          COUNT(p.id) FILTER (WHERE p.status IN ('APPROVED', 'DELIVERED', 'COMPLETED')) as completed_tasks
        FROM users u
        LEFT JOIN projects p ON p.developer_id = u.id
        WHERE u.role = 'DEVELOPER' AND u.is_active = TRUE
        GROUP BY u.id
        ORDER BY active_tasks DESC, u.full_name ASC
      `),
      db.query(`
        SELECT a.id, a.action, a.entity_type, a.entity_id, a.details, a.created_at, u.full_name as user_name, u.role as user_role
        FROM audit_logs a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
        LIMIT 15
      `)
    ]);

    return {
      users: {
        total: parseInt(usersCountRes.rows[0].total_users, 10),
        clients: parseInt(usersCountRes.rows[0].total_clients, 10),
        developers: parseInt(usersCountRes.rows[0].total_developers, 10),
        active: parseInt(usersCountRes.rows[0].active_users, 10)
      },
      orders: {
        total: parseInt(ordersCountRes.rows[0].total_orders, 10),
        paid: parseInt(ordersCountRes.rows[0].paid_orders, 10),
        pending: parseInt(ordersCountRes.rows[0].pending_orders, 10),
        submittedCount: parseInt(ordersCountRes.rows[0].submitted_projects_count, 10)
      },
      projects: {
        total: parseInt(projectsCountRes.rows[0].total_projects, 10),
        newSubmissions: parseInt(projectsCountRes.rows[0].new_submissions, 10),
        inScoping: parseInt(projectsCountRes.rows[0].in_scoping, 10),
        awaitingAssignment: parseInt(projectsCountRes.rows[0].awaiting_assignment, 10),
        assigned: parseInt(projectsCountRes.rows[0].assigned_projects, 10),
        inDevelopment: parseInt(projectsCountRes.rows[0].in_development, 10),
        awaitingReview: parseInt(projectsCountRes.rows[0].awaiting_review, 10),
        inRevision: parseInt(projectsCountRes.rows[0].in_revision, 10),
        completed: parseInt(projectsCountRes.rows[0].completed_projects, 10)
      },
      financials: {
        currency: 'NGN',
        totalRevenueNgn: parseFloat(revenueRes.rows[0].total_revenue_ngn),
        pendingRevenueNgn: parseFloat(revenueRes.rows[0].pending_revenue_ngn),
        successfulTransactions: parseInt(revenueRes.rows[0].verified_payments_count, 10),
        byPackage: packageRevenueRes.rows
      },
      engineers: {
        totalActive: engineersWorkloadRes.rows.length,
        workload: engineersWorkloadRes.rows
      },
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

  async getOrders({ status = null, packageId = null, search = null, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT o.*,
             c.full_name as client_name, c.email as client_email, c.phone_number as client_phone,
             p.id as project_id, p.project_code, p.title as project_title, p.status as project_status, p.submission_status,
             dev.full_name as assigned_engineer_name, dev.email as assigned_engineer_email,
             pay.provider_reference as paystack_ref, pay.channel as payment_channel, pay.paid_at as payment_date,
             pay.status as payment_record_status
      FROM orders o
      LEFT JOIN users c ON c.id = o.client_id
      LEFT JOIN projects p ON p.order_id = o.id
      LEFT JOIN users dev ON dev.id = p.developer_id
      LEFT JOIN payments pay ON pay.order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND o.payment_status = $${params.length}`;
    }

    if (packageId) {
      params.push(packageId);
      sql += ` AND o.package_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (o.id::text ILIKE $${params.length} OR o.customer_email ILIKE $${params.length} OR o.customer_name ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR p.project_code ILIKE $${params.length} OR pay.provider_reference ILIKE $${params.length})`;
    }

    const countRes = await db.query(
      sql.replace(/SELECT o\.\*,[\s\S]*?FROM orders o/, 'SELECT COUNT(*) as total FROM orders o'),
      params
    );

    sql += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(sql, params);

    return {
      orders: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async updateOrderFulfillment(orderId, fulfillmentStatus) {
    const res = await db.query(
      `UPDATE orders SET fulfillment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [fulfillmentStatus, orderId]
    );
    return res.rows[0];
  }
}

module.exports = new AdminService();
