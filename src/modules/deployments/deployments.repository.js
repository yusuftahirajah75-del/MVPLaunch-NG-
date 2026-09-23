/**
 * MVPLaunch NG - Deployments Repository
 */
const db = require('../../config/db');

class DeploymentsRepository {
  async create({ projectId, environment, deploymentUrl, commitHash, status, notes, deployedBy }) {
    const res = await db.query(
      `INSERT INTO deployments (project_id, environment, deployment_url, commit_hash, status, notes, deployed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId, environment, deploymentUrl, commitHash || null, status || 'LIVE', notes || null, deployedBy]
    );
    return res.rows[0];
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT d.*, u.full_name as deployed_by_name
       FROM deployments d
       LEFT JOIN users u ON u.id = d.deployed_by
       WHERE d.project_id = $1
       ORDER BY d.created_at DESC`,
      [projectId]
    );
    return res.rows;
  }
}

module.exports = new DeploymentsRepository();
