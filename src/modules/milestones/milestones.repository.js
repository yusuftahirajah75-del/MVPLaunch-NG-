/**
 * MVPLaunch NG - Milestones Repository
 */
const db = require('../../config/db');

class MilestonesRepository {
  async create({ projectId, title, description, orderIndex, amountNgn, dueDate }) {
    const res = await db.query(
      `INSERT INTO milestones (project_id, title, description, order_index, amount_ngn, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [projectId, title, description || null, orderIndex, amountNgn, dueDate || null]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query(
      `SELECT m.*, p.client_id, p.developer_id, p.title as project_title
       FROM milestones m
       JOIN projects p ON p.id = m.project_id
       WHERE m.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT m.*,
              (SELECT COUNT(*) FROM tasks t WHERE t.milestone_id = m.id) as total_tasks,
              (SELECT COUNT(*) FROM tasks t WHERE t.milestone_id = m.id AND t.status = 'DONE') as completed_tasks
       FROM milestones m
       WHERE m.project_id = $1
       ORDER BY m.order_index ASC`,
      [projectId]
    );
    return res.rows;
  }

  async update(id, { title, description, status, dueDate }) {
    const res = await db.query(
      `UPDATE milestones
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           due_date = COALESCE($4, due_date)
       WHERE id = $5
       RETURNING *`,
      [title, description, status, dueDate, id]
    );
    return res.rows[0];
  }

  async submitForReview(id) {
    const res = await db.query(
      `UPDATE milestones
       SET status = 'SUBMITTED', submitted_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return res.rows[0];
  }

  async approve(id) {
    const res = await db.query(
      `UPDATE milestones
       SET status = 'APPROVED', approved_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return res.rows[0];
  }
}

module.exports = new MilestonesRepository();
