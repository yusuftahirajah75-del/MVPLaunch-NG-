/**
 * MVPLaunch NG - Orders Repository
 */
const db = require('../../config/db');

class OrdersRepository {
  async findById(id) {
    const res = await db.query(
      `SELECT o.*,
              p.title as project_title, p.slug as project_slug,
              c.full_name as client_name, c.email as client_email,
              pr.title as proposal_title
       FROM orders o
       LEFT JOIN projects p ON p.id = o.project_id
       LEFT JOIN users c ON c.id = o.client_id
       LEFT JOIN proposals pr ON pr.id = o.proposal_id
       WHERE o.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByProjectId(projectId) {
    const res = await db.query('SELECT * FROM orders WHERE project_id = $1', [projectId]);
    return res.rows[0] || null;
  }

  async findByUser(userId, role, { limit = 20, offset = 0 } = {}) {
    let query = `
      SELECT o.*, p.title as project_title, c.full_name as client_name
      FROM orders o
      LEFT JOIN projects p ON p.id = o.project_id
      LEFT JOIN users c ON c.id = o.client_id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'CLIENT') {
      params.push(userId);
      query += ` AND o.client_id = $${params.length}`;
    }

    const countRes = await db.query(
      query.replace('SELECT o.*, p.title as project_title, c.full_name as client_name', 'SELECT COUNT(*) as total'),
      params
    );

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return {
      orders: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async updateStatus(id, status) {
    const res = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  }

  async updatePaymentStatus(id, paymentStatus) {
    const res = await db.query(
      `UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *`,
      [paymentStatus, id]
    );
    return res.rows[0];
  }

  async updateFulfillmentStatus(id, fulfillmentStatus) {
    const res = await db.query(
      `UPDATE orders SET fulfillment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [fulfillmentStatus, id]
    );
    return res.rows[0];
  }
}

module.exports = new OrdersRepository();
