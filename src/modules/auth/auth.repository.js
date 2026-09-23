/**
 * MVPLaunch NG - Auth Repository
 */
const db = require('../../config/db');

class AuthRepository {
  async findByEmail(email) {
    const res = await db.query(
      `SELECT id, email, password_hash, full_name, phone_number, role, avatar_url, bio, is_active, is_verified, created_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id) {
    const res = await db.query(
      `SELECT id, email, full_name, phone_number, role, avatar_url, bio, is_active, is_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async createUser({ email, passwordHash, fullName, phoneNumber, role }) {
    const res = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role)
       VALUES (LOWER($1), $2, $3, $4, $5)
       RETURNING id, email, full_name, phone_number, role, is_active, is_verified, created_at`,
      [email, passwordHash, fullName, phoneNumber, role]
    );
    return res.rows[0];
  }

  async updatePassword(userId, newPasswordHash) {
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );
  }

  async createSession({ userId, refreshTokenHash, ipAddress, userAgent, expiresAt }) {
    const res = await db.query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, refreshTokenHash, ipAddress, userAgent, expiresAt]
    );
    return res.rows[0];
  }

  async deleteSession(userId) {
    await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
  }
}

module.exports = new AuthRepository();
