/**
 * MVPLaunch NG - Audit Logs Repository
 */
const db = require('../../config/db');

class AuditRepository {
  async findAll({ userId, action, entityType, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT a.*, u.full_name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      params.push(userId);
      query += ` AND a.user_id = $${params.length}`;
    }
    if (action) {
      params.push(action);
      query += ` AND a.action ILIKE $${params.length}`;
    }
    if (entityType) {
      params.push(entityType);
      query += ` AND a.entity_type = $${params.length}`;
    }

    const countRes = await db.query(
      query.replace('SELECT a.*, u.full_name as user_name, u.email as user_email, u.role as user_role', 'SELECT COUNT(*) as total'),
      params
    );

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return {
      auditLogs: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }
}

module.exports = new AuditRepository();
