/**
 * MVPLaunch NG - Handover Repository
 */
const db = require('../../config/db');

class HandoverRepository {
  async upsert({ projectId, githubRepo, documentationUrl, notes }) {
    const res = await db.query(
      `INSERT INTO handovers (project_id, github_repo, documentation_url, notes, status)
       VALUES ($1, $2, $3, $4, 'PREPARING')
       ON CONFLICT (project_id) DO UPDATE SET
         github_repo = EXCLUDED.github_repo,
         documentation_url = COALESCE(EXCLUDED.documentation_url, handovers.documentation_url),
         notes = COALESCE(EXCLUDED.notes, handovers.notes)
       RETURNING *`,
      [projectId, githubRepo, documentationUrl || null, notes || null]
    );
    return res.rows[0];
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT h.*, p.title as project_title, p.client_id, p.developer_id
       FROM handovers h
       JOIN projects p ON p.id = h.project_id
       WHERE h.project_id = $1`,
      [projectId]
    );
    return res.rows[0] || null;
  }

  async updateChecklist(projectId, { accessTransferred, credentialsTransferred, documentationUrl, notes }) {
    const res = await db.query(
      `UPDATE handovers
       SET access_transferred = COALESCE($1, access_transferred),
           credentials_transferred = COALESCE($2, credentials_transferred),
           documentation_url = COALESCE($3, documentation_url),
           notes = COALESCE($4, notes)
       WHERE project_id = $5
       RETURNING *`,
      [accessTransferred, credentialsTransferred, documentationUrl, notes, projectId]
    );
    return res.rows[0];
  }

  async signoffDeveloper(projectId) {
    const res = await db.query(
      `UPDATE handovers
       SET developer_signoff_at = CURRENT_TIMESTAMP, status = 'SUBMITTED'
       WHERE project_id = $1
       RETURNING *`,
      [projectId]
    );
    return res.rows[0];
  }

  async signoffClient(projectId) {
    const res = await db.query(
      `UPDATE handovers
       SET client_signoff_at = CURRENT_TIMESTAMP, status = 'ACCEPTED'
       WHERE project_id = $1
       RETURNING *`,
      [projectId]
    );
    return res.rows[0];
  }
}

module.exports = new HandoverRepository();
