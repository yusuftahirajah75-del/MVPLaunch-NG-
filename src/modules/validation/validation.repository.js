/**
 * MVPLaunch NG - Validation Repository
 */
const db = require('../../config/db');

class ValidationRepository {
  async create({ projectId, testingPhase, totalTesters, keyFindings, userFeedback, netPromoterScore }) {
    const res = await db.query(
      `INSERT INTO user_validations (project_id, testing_phase, total_testers, key_findings, user_feedback, net_promoter_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [projectId, testingPhase, totalTesters, keyFindings, JSON.stringify(userFeedback || []), netPromoterScore || null]
    );
    return res.rows[0];
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT * FROM user_validations WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    );
    return res.rows;
  }
}

module.exports = new ValidationRepository();
