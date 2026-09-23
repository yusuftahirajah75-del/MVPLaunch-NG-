/**
 * MVPLaunch NG - Files Repository
 */
const db = require('../../config/db');

class FilesRepository {
  async create({ projectId, uploaderId, fileName, fileUrl, fileSizeBytes, mimeType, fileCategory }) {
    const res = await db.query(
      `INSERT INTO files (project_id, uploader_id, file_name, file_url, file_size_bytes, mime_type, file_category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId || null, uploaderId, fileName, fileUrl, fileSizeBytes, mimeType, fileCategory || 'SPEC']
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM files WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findByProjectId(projectId) {
    const res = await db.query(
      `SELECT f.*, u.full_name as uploader_name, u.role as uploader_role
       FROM files f
       JOIN users u ON u.id = f.uploader_id
       WHERE f.project_id = $1
       ORDER BY f.created_at DESC`,
      [projectId]
    );
    return res.rows;
  }

  async delete(id) {
    await db.query('DELETE FROM files WHERE id = $1', [id]);
  }
}

module.exports = new FilesRepository();
