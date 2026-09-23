/**
 * MVPLaunch NG - Payments Repository
 */
const db = require('../../config/db');

class PaymentsRepository {
  async create({ orderId, milestoneId, userId, amountNgn, provider, providerReference, status, channel, metadata }) {
    const res = await db.query(
      `INSERT INTO payments (order_id, milestone_id, user_id, amount_ngn, provider, provider_reference, status, channel, paystack_metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        orderId,
        milestoneId || null,
        userId,
        amountNgn,
        provider || 'PAYSTACK',
        providerReference,
        status || 'INITIALIZED',
        channel || null,
        JSON.stringify(metadata || {})
      ]
    );
    return res.rows[0];
  }

  async findByReference(reference) {
    const res = await db.query('SELECT * FROM payments WHERE provider_reference = $1', [reference]);
    return res.rows[0] || null;
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findByOrderId(orderId) {
    const res = await db.query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
      [orderId]
    );
    return res.rows;
  }

  async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    const countRes = await db.query('SELECT COUNT(*) as total FROM payments WHERE user_id = $1', [userId]);
    const res = await db.query(
      `SELECT p.*, o.project_id
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return {
      payments: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async markAsVerified(reference, { channel, paidAt, metadata }) {
    const res = await db.query(
      `UPDATE payments
       SET status = 'VERIFIED',
           channel = COALESCE($1, channel),
           paid_at = COALESCE($2, CURRENT_TIMESTAMP),
           paystack_metadata = $3
       WHERE provider_reference = $4
       RETURNING *`,
      [channel, paidAt, JSON.stringify(metadata || {}), reference]
    );
    return res.rows[0];
  }
}

module.exports = new PaymentsRepository();
