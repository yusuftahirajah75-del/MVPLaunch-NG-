/**
 * MVPLaunch NG - Proposals Repository
 */
const db = require('../../config/db');

class ProposalsRepository {
  async create({ projectId, developerId, title, priceNgn, durationDays, deliverables, terms, validUntil }) {
    const res = await db.query(
      `INSERT INTO proposals (project_id, developer_id, title, price_ngn, duration_days, deliverables, terms, valid_until, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
       RETURNING *`,
      [projectId, developerId, title, priceNgn, durationDays, JSON.stringify(deliverables), terms, validUntil]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query(
      `SELECT pr.*, 
              p.client_id, p.title as project_title,
              d.full_name as developer_name, d.email as developer_email
       FROM proposals pr
       JOIN projects p ON p.id = pr.project_id
       LEFT JOIN users d ON d.id = pr.developer_id
       WHERE pr.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT pr.*, d.full_name as developer_name
       FROM proposals pr
       LEFT JOIN users d ON d.id = pr.developer_id
       WHERE pr.project_id = $1
       ORDER BY pr.created_at DESC`,
      [projectId]
    );
    return res.rows;
  }

  async updateStatus(id, status) {
    const res = await db.query(
      `UPDATE proposals
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  }
}

module.exports = new ProposalsRepository();
