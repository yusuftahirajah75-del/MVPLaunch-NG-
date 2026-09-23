/**
 * MVPLaunch NG - Ideas Repository
 */
const db = require('../../config/db');

class IdeasRepository {
  async create({ clientId, title, rawSummary, targetIndustry, budgetBracket, targetTimeline }) {
    const res = await db.query(
      `INSERT INTO ideas (client_id, title, raw_summary, target_industry, budget_bracket, target_timeline, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'SUBMITTED')
       RETURNING *`,
      [clientId, title, rawSummary, targetIndustry, budgetBracket, targetTimeline]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query(
      `SELECT i.*, u.full_name as client_name, u.email as client_email, u.phone_number as client_phone
       FROM ideas i
       JOIN users u ON u.id = i.client_id
       WHERE i.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByClientId(clientId, { limit = 20, offset = 0 } = {}) {
    const countRes = await db.query('SELECT COUNT(*) as total FROM ideas WHERE client_id = $1', [clientId]);
    const res = await db.query(
      `SELECT * FROM ideas WHERE client_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [clientId, limit, offset]
    );
    return {
      ideas: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async findAll({ status, limit = 20, offset = 0 } = {}) {
    let query = `
      SELECT i.*, u.full_name as client_name, u.email as client_email
      FROM ideas i
      JOIN users u ON u.id = i.client_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }

    const countRes = await db.query(
      query.replace('SELECT i.*, u.full_name as client_name, u.email as client_email', 'SELECT COUNT(*) as total'),
      params
    );

    query += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return {
      ideas: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async updateStatus(id, { status, adminNotes }) {
    const res = await db.query(
      `UPDATE ideas
       SET status = $1, admin_notes = COALESCE($2, admin_notes)
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes, id]
    );
    return res.rows[0];
  }
}

module.exports = new IdeasRepository();
