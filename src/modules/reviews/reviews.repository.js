/**
 * MVPLaunch NG - Reviews Repository
 */
const db = require('../../config/db');

class ReviewsRepository {
  async create({ projectId, clientId, rating, title, feedbackText }) {
    const res = await db.query(
      `INSERT INTO reviews (project_id, client_id, rating, title, feedback_text, is_published)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [projectId, clientId, rating, title || null, feedbackText]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findPublicReviews({ limit = 10, offset = 0 } = {}) {
    const res = await db.query(
      `SELECT r.*, u.full_name as client_name, u.avatar_url as client_avatar, p.title as project_title
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       JOIN projects p ON p.id = r.project_id
       WHERE r.is_published = TRUE
       ORDER BY r.is_featured DESC, r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  }

  async setFeatured(id, isFeatured) {
    const res = await db.query(
      `UPDATE reviews SET is_featured = $1 WHERE id = $2 RETURNING *`,
      [isFeatured, id]
    );
    return res.rows[0];
  }
}

module.exports = new ReviewsRepository();
