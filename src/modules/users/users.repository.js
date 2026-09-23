/**
 * MVPLaunch NG - Users Repository
 */
const db = require('../../config/db');

class UsersRepository {
  async findAll({ role, search, limit = 20, offset = 0 }) {
    let baseQuery = `
      SELECT id, email, full_name, phone_number, role, avatar_url, bio, is_active, is_verified, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      baseQuery += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    const countRes = await db.query(
      baseQuery.replace('SELECT id, email, full_name, phone_number, role, avatar_url, bio, is_active, is_verified, created_at', 'SELECT COUNT(*) as total'),
      params
    );

    baseQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(baseQuery, params);
    return {
      users: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async findById(id) {
    const res = await db.query(
      `SELECT id, email, full_name, phone_number, role, avatar_url, bio, is_active, is_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async updateProfile(id, { fullName, phoneNumber, bio, avatarUrl }) {
    const res = await db.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone_number = COALESCE($2, phone_number),
           bio = COALESCE($3, bio),
           avatar_url = COALESCE($4, avatar_url)
       WHERE id = $5
       RETURNING id, email, full_name, phone_number, role, avatar_url, bio, is_active, is_verified, created_at`,
      [fullName, phoneNumber, bio, avatarUrl, id]
    );
    return res.rows[0];
  }

  async setStatus(id, isActive) {
    const res = await db.query(
      `UPDATE users SET is_active = $1 WHERE id = $2
       RETURNING id, email, full_name, role, is_active`,
      [isActive, id]
    );
    return res.rows[0];
  }
}

module.exports = new UsersRepository();
