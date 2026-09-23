/**
 * MVPLaunch NG - Maintenance Repository
 */
const db = require('../../config/db');

class MaintenanceRepository {
  async create({ projectId, clientId, planName, monthlyFeeNgn, supportHoursPerMonth, nextBillingDate }) {
    const res = await db.query(
      `INSERT INTO maintenance_subscriptions (project_id, client_id, plan_name, monthly_fee_ngn, support_hours_per_month, next_billing_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
       RETURNING *`,
      [projectId, clientId, planName, monthlyFeeNgn, supportHoursPerMonth, nextBillingDate || null]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query(
      `SELECT m.*, p.title as project_title, c.full_name as client_name
       FROM maintenance_subscriptions m
       JOIN projects p ON p.id = m.project_id
       JOIN users c ON c.id = m.client_id
       WHERE m.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByProjectId(projectId) {
    const res = await db.query('SELECT * FROM maintenance_subscriptions WHERE project_id = $1', [projectId]);
    return res.rows;
  }

  async findByClientId(clientId) {
    const res = await db.query(
      `SELECT m.*, p.title as project_title
       FROM maintenance_subscriptions m
       JOIN projects p ON p.id = m.project_id
       WHERE m.client_id = $1
       ORDER BY m.created_at DESC`,
      [clientId]
    );
    return res.rows;
  }

  async updateStatus(id, status) {
    const res = await db.query(
      `UPDATE maintenance_subscriptions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  }
}

module.exports = new MaintenanceRepository();
