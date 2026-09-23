/**
 * MVPLaunch NG - Notifications Repository
 */
const db = require('../../config/db');

class NotificationsRepository {
  async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    const countRes = await db.query('SELECT COUNT(*) as total FROM notifications WHERE user_id = $1', [userId]);
    const unreadRes = await db.query('SELECT COUNT(*) as unread FROM notifications WHERE user_id = $1 AND is_read = FALSE', [userId]);

    const res = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      notifications: res.rows,
      total: parseInt(countRes.rows[0].total, 10),
      unreadCount: parseInt(unreadRes.rows[0].unread, 10)
    };
  }

  async markAsRead(id, userId) {
    const res = await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return res.rows[0];
  }

  async markAllAsRead(userId) {
    await db.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [userId]);
  }
}

module.exports = new NotificationsRepository();
