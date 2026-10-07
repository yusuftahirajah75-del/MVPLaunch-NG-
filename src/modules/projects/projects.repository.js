/**
 * MVPLaunch NG - Projects Repository
 * Production-ready queries for Project Submissions, Engineer Assignments, Deliverables & Notes
 */
const db = require('../../config/db');

class ProjectsRepository {
  async create({ ideaId, clientId, developerId, title, slug, description, targetDeliveryDate }) {
    const res = await db.query(
      `INSERT INTO projects (idea_id, client_id, developer_id, title, slug, description, target_delivery_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT')
       RETURNING *`,
      [ideaId || null, clientId, developerId || null, title, slug, description || null, targetDeliveryDate || null]
    );
    return res.rows[0];
  }

  async createSubmission({
    orderId,
    clientId,
    projectCode,
    title,
    slug,
    organizationName,
    industry,
    problemStatement,
    targetUsers,
    proposedSolution,
    coreFeatures,
    niceToHaveFeatures,
    expectedOutcome,
    existingProductUrl,
    competitorReferences,
    designPreferences,
    technicalRequirements,
    preferredDeadline,
    selectedPackageId,
    selectedPackageName,
    paymentReference,
    attachmentUrl,
    additionalNotes
  }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const projRes = await client.query(
        `INSERT INTO projects (
          order_id, client_id, project_code, title, slug,
          organization_name, industry, problem_statement, target_users, proposed_solution,
          core_features, nice_to_have_features, expected_outcome, existing_product_url,
          competitor_references, design_preferences, technical_requirements, preferred_deadline,
          selected_package_id, selected_package_name, payment_reference, attachment_url, additional_notes,
          status, submission_status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11::jsonb, $12::jsonb, $13, $14,
          $15, $16, $17, $18,
          $19, $20, $21, $22, $23,
          'SUBMITTED', 'SUBMITTED'
        )
        RETURNING *`,
        [
          orderId || null,
          clientId,
          projectCode,
          title,
          slug,
          organizationName || null,
          industry || 'Other / Custom',
          problemStatement || '',
          targetUsers || '',
          proposedSolution || '',
          JSON.stringify(coreFeatures || []),
          JSON.stringify(niceToHaveFeatures || []),
          expectedOutcome || null,
          existingProductUrl || null,
          competitorReferences || null,
          designPreferences || null,
          technicalRequirements || null,
          preferredDeadline || null,
          selectedPackageId || null,
          selectedPackageName || null,
          paymentReference || null,
          attachmentUrl || null,
          additionalNotes || null
        ]
      );

      const project = projRes.rows[0];

      // Update linked order if provided
      if (orderId) {
        await client.query(
          `UPDATE orders
           SET project_id = $1,
               project_submitted = TRUE,
               fulfillment_status = 'IN_PROGRESS'
           WHERE id = $2`,
          [project.id, orderId]
        );
      }

      await client.query('COMMIT');
      return project;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const res = await db.query(
      `SELECT p.*,
              c.full_name as client_name, c.email as client_email, c.phone_number as client_phone,
              d.full_name as developer_name, d.email as developer_email, d.skills as developer_skills, d.bio as developer_bio,
              o.total_amount_ngn, o.payment_status, o.package_name, o.customer_email, o.customer_phone,
              pay.provider_reference as paystack_ref, pay.paid_at as payment_date
       FROM projects p
       JOIN users c ON c.id = p.client_id
       LEFT JOIN users d ON d.id = p.developer_id
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN payments pay ON pay.order_id = o.id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByIdWithDetails(id) {
    return this.findById(id);
  }

  async findByCode(projectCode) {
    const res = await db.query(
      `SELECT p.*,
              c.full_name as client_name, c.email as client_email,
              d.full_name as developer_name, d.email as developer_email
       FROM projects p
       JOIN users c ON c.id = p.client_id
       LEFT JOIN users d ON d.id = p.developer_id
       WHERE p.project_code = $1`,
      [projectCode]
    );
    return res.rows[0] || null;
  }

  async findBySlug(slug) {
    const res = await db.query(
      `SELECT p.*,
              c.full_name as client_name, c.email as client_email,
              d.full_name as developer_name, d.email as developer_email
       FROM projects p
       JOIN users c ON c.id = p.client_id
       LEFT JOIN users d ON d.id = p.developer_id
       WHERE p.slug = $1`,
      [slug]
    );
    return res.rows[0] || null;
  }

  async findByUser({ userId, role, status, limit = 50, offset = 0 }) {
    let query = `
      SELECT p.*,
             c.full_name as client_name, c.email as client_email,
             d.full_name as developer_name, d.email as developer_email,
             o.payment_status, o.package_name as order_package_name
      FROM projects p
      JOIN users c ON c.id = p.client_id
      LEFT JOIN users d ON d.id = p.developer_id
      LEFT JOIN orders o ON o.id = p.order_id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'CLIENT') {
      params.push(userId);
      query += ` AND p.client_id = $${params.length}`;
    } else if (role === 'DEVELOPER') {
      params.push(userId);
      query += ` AND p.developer_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    const countRes = await db.query(
      `SELECT COUNT(*) as total FROM projects p WHERE 1=1` +
      (role === 'CLIENT' ? ` AND p.client_id = '${userId}'` : '') +
      (role === 'DEVELOPER' ? ` AND p.developer_id = '${userId}'` : '') +
      (status ? ` AND p.status = '${status}'` : '')
    );

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return {
      projects: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async listAllForAdmin({ status, packageId, industry, search, limit = 50, offset = 0 }) {
    let query = `
      SELECT p.*,
             c.full_name as client_name, c.email as client_email, c.phone_number as client_phone,
             d.full_name as developer_name, d.email as developer_email,
             o.total_amount_ngn, o.payment_status, o.package_name as order_package_name, o.customer_phone
      FROM projects p
      JOIN users c ON c.id = p.client_id
      LEFT JOIN users d ON d.id = p.developer_id
      LEFT JOIN orders o ON o.id = p.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    if (packageId) {
      params.push(packageId);
      query += ` AND (p.selected_package_id = $${params.length} OR o.package_id = $${params.length})`;
    }

    if (industry) {
      params.push(industry);
      query += ` AND p.industry = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.project_code ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR c.email ILIKE $${params.length})`;
    }

    const countRes = await db.query(
      query.replace(/SELECT p\.\*,[\s\S]*?FROM projects p/, 'SELECT COUNT(*) as total FROM projects p'),
      params
    );

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return {
      projects: res.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async updateScope(id, { adminNotes, adminInstructions, acceptanceCriteria, internalDeadline, priority, status }) {
    const res = await db.query(
      `UPDATE projects
       SET admin_notes = COALESCE($1, admin_notes),
           admin_instructions = COALESCE($2, admin_instructions),
           acceptance_criteria = COALESCE($3, acceptance_criteria),
           internal_deadline = COALESCE($4::timestamp, internal_deadline),
           priority = COALESCE($5, priority),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7::uuid
       RETURNING *`,
      [adminNotes || null, adminInstructions || null, acceptanceCriteria || null, internalDeadline || null, priority || null, status || null, id]
    );
    return res.rows[0];
  }

  async assignEngineer(id, { developerId, instructions, priority, internalDeadline }) {
    const res = await db.query(
      `UPDATE projects
       SET developer_id = $1::uuid,
           admin_instructions = COALESCE($2, admin_instructions),
           priority = COALESCE($3, priority),
           internal_deadline = COALESCE($4::timestamp, internal_deadline),
           status = CASE WHEN $1::uuid IS NOT NULL THEN 'ENGINEER_ASSIGNED' ELSE 'AWAITING_ENGINEER' END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5::uuid
       RETURNING *`,
      [developerId || null, instructions || null, priority || null, internalDeadline || null, id]
    );
    return res.rows[0];
  }

  async updateProgress(id, { progressPercent, completedFeatures, knownLimitations, deliverableNotes, status }) {
    const res = await db.query(
      `UPDATE projects
       SET progress_percent = COALESCE($1, progress_percent),
           completed_features = COALESCE($2, completed_features),
           known_limitations = COALESCE($3, known_limitations),
           deliverable_notes = COALESCE($4, deliverable_notes),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [progressPercent, completedFeatures, knownLimitations, deliverableNotes, status, id]
    );
    return res.rows[0];
  }

  async updateStatus(id, { status, repoUrl, stagingUrl, productionUrl }) {
    const res = await db.query(
      `UPDATE projects
       SET status = $1,
           repo_url = COALESCE($2, repo_url),
           staging_url = COALESCE($3, staging_url),
           production_url = COALESCE($4, production_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, repoUrl, stagingUrl, productionUrl, id]
    );
    return res.rows[0];
  }

  // --- Project Notes (Admin ↔ Engineer Communication) ---
  async addNote({ projectId, authorId, authorRole, content, noteType = 'INTERNAL', isInternal = true }) {
    const res = await db.query(
      `INSERT INTO project_notes (project_id, author_id, author_role, content, note_type, is_internal)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [projectId, authorId, authorRole, content, noteType, isInternal]
    );
    return res.rows[0];
  }

  async getNotes(projectId, { internalOnly = false } = {}) {
    let query = `
      SELECT n.*, u.full_name as author_name, u.role as author_role
      FROM project_notes n
      JOIN users u ON u.id = n.author_id
      WHERE n.project_id = $1
    `;
    if (!internalOnly) {
      query += ` AND n.is_internal = TRUE`;
    }
    query += ` ORDER BY n.created_at ASC`;
    const res = await db.query(query, [projectId]);
    return res.rows;
  }

  // --- Deliverables ---
  async addDeliverable({ projectId, developerId, title, stagingUrl, repoUrl, productionUrl, notes }) {
    const res = await db.query(
      `INSERT INTO project_deliverables (
        project_id, developer_id, title, staging_url, repo_url, production_url, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'SUBMITTED')
      RETURNING *`,
      [projectId, developerId, title, stagingUrl || null, repoUrl || null, productionUrl || null, notes || null]
    );
    return res.rows[0];
  }

  async getDeliverables(projectId) {
    const res = await db.query(
      `SELECT d.*, u.full_name as developer_name
       FROM project_deliverables d
       JOIN users u ON u.id = d.developer_id
       WHERE d.project_id = $1
       ORDER BY d.submitted_at DESC`,
      [projectId]
    );
    return res.rows;
  }

  async updateDeliverableReview(deliverableId, { status, adminFeedback }) {
    const res = await db.query(
      `UPDATE project_deliverables
       SET status = $1,
           admin_feedback = $2,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, adminFeedback, deliverableId]
    );
    return res.rows[0];
  }

  // --- Engineers List with Workload ---
  async listEngineers() {
    const res = await db.query(`
      SELECT u.id, u.full_name, u.email, u.phone_number, u.bio, u.skills,
             u.availability_status, u.specializations,
             COUNT(p.id) FILTER (WHERE p.status IN ('ENGINEER_ASSIGNED', 'IN_DEVELOPMENT', 'INTERNAL_REVIEW', 'REVISION_REQUIRED')) as active_projects,
             COUNT(p.id) FILTER (WHERE p.status = 'COMPLETED') as completed_projects
      FROM users u
      LEFT JOIN projects p ON p.developer_id = u.id
      WHERE u.role = 'DEVELOPER' AND u.is_active = TRUE
      GROUP BY u.id
      ORDER BY active_projects ASC, u.full_name ASC
    `);
    return res.rows;
  }
}

module.exports = new ProjectsRepository();
