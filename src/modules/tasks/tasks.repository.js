/**
 * MVPLaunch NG - Tasks Repository
 */
const db = require('../../config/db');

class TasksRepository {
  async create({ milestoneId, projectId, title, description, priority, assignedTo }) {
    const res = await db.query(
      `INSERT INTO tasks (milestone_id, project_id, title, description, priority, assigned_to, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'TODO')
       RETURNING *`,
      [milestoneId, projectId, title, description || null, priority, assignedTo || null]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query(
      `SELECT t.*, u.full_name as assignee_name, p.client_id, p.developer_id
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByMilestoneId(milestoneId) {
    const res = await db.query(
      `SELECT t.*, u.full_name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.milestone_id = $1
       ORDER BY t.created_at ASC`,
      [milestoneId]
    );
    return res.rows;
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT t.*, m.title as milestone_title, u.full_name as assignee_name
       FROM tasks t
       JOIN milestones m ON m.id = t.milestone_id
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.project_id = $1
       ORDER BY m.order_index ASC, t.created_at ASC`,
      [projectId]
    );
    return res.rows;
  }

  async update(id, { title, description, status, priority, assignedTo }) {
    const completedAt = status === 'DONE' ? 'CURRENT_TIMESTAMP' : 'NULL';
    const res = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assigned_to = COALESCE($5, assigned_to),
           completed_at = CASE WHEN $3 = 'DONE' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $6
       RETURNING *`,
      [title, description, status, priority, assignedTo, id]
    );
    return res.rows[0];
  }

  async delete(id) {
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  }
}

module.exports = new TasksRepository();
