/**
 * MVPLaunch NG - Projects Repository
 */
const db = require('../../config/db');

class ProjectsRepository {
  async create({ ideaId, clientId, developerId, title, slug, description, targetDeliveryDate }) {
    const res = await db.query(
      `INSERT INTO projects (idea_id, client_id, developer_id, title, slug, description, target_delivery_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT')
       RETURNING *`,
      [ideaId || null, clientId, developerId || null, title, slug, description || null, targetDeliveryDate || null]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query(
      `SELECT p.*,
              c.full_name as client_name, c.email as client_email, c.phone_number as client_phone,
              d.full_name as developer_name, d.email as developer_email
       FROM projects p
       JOIN users c ON c.id = p.client_id
       LEFT JOIN users d ON d.id = p.developer_id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findBySlug(slug) {
    const res = await db.query(
      `SELECT p.*,
              c.full_name as client_name, c.email as client_email,
              d.full_name as developer_name, d.email as developer_email
       FROM projects p
       JOIN users c ON c.id = p.client_id
       LEFT JOIN users d ON d.id = p.developer_id
       WHERE p.slug = $1`,
      [slug]
    );
    return res.rows[0] || null;
  }

  async findByUser({ userId, role, status, limit = 20, offset = 0 }) {
    let query = `
      SELECT p.*,
             c.full_name as client_name,
             d.full_name as developer_name
      FROM projects p
      JOIN users c ON c.id = p.client_id
      LEFT JOIN users d ON d.id = p.developer_id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'CLIENT') {
      params.push(userId);
      query += ` AND p.client_id = $${params.length}`;
    } else if (role === 'DEVELOPER') {
      params.push(userId);
      query += ` AND p.developer_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    const countRes = await db.query(
      query.replace('SELECT p.*,\n             c.full_name as client_name,\n             d.full_name as developer_name', 'SELECT COUNT(*) as total'),
      params
    );

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return {
      projects: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async updateStatus(id, { status, repoUrl, stagingUrl, productionUrl }) {
    const res = await db.query(
      `UPDATE projects
       SET status = $1,
           repo_url = COALESCE($2, repo_url),
           staging_url = COALESCE($3, staging_url),
           production_url = COALESCE($4, production_url)
       WHERE id = $5
       RETURNING *`,
      [status, repoUrl, stagingUrl, productionUrl, id]
    );
    return res.rows[0];
  }

  async assignDeveloper(id, developerId) {
    const res = await db.query(
      `UPDATE projects
       SET developer_id = $1
       WHERE id = $2
       RETURNING *`,
      [developerId, id]
    );
    return res.rows[0];
  }
}

module.exports = new ProjectsRepository();
