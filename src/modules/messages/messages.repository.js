/**
 * MVPLaunch NG - Messages Repository
 */
const db = require('../../config/db');

class MessagesRepository {
  async create({ projectId, senderId, content, attachments }) {
    const res = await db.query(
      `INSERT INTO messages (project_id, sender_id, content, attachments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projectId, senderId, content, JSON.stringify(attachments || [])]
    );
    return res.rows[0];
  }

  async findByProjectId(projectId, { limit = 50, offset = 0 } = {}) {
    const countRes = await db.query('SELECT COUNT(*) as total FROM messages WHERE project_id = $1', [projectId]);
    const res = await db.query(
      `SELECT m.*, u.full_name as sender_name, u.role as sender_role, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [projectId, limit, offset]
    );
    return {
      messages: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async markAsRead(projectId, currentUserId) {
    await db.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE project_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [projectId, currentUserId]
    );
  }
}

module.exports = new MessagesRepository();
