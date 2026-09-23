/**
 * MVPLaunch NG - Handover Service
 */
const handoverRepo = require('./handover.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');
const db = require('../../config/db');

class HandoverService {
  async initiateHandover(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Only developers or administrators can initialize handover.');
    }

    const handover = await handoverRepo.upsert(data);

    await recordAuditLog({
      userId: user.id,
      action: 'HANDOVER_INITIATED',
      entityType: 'HANDOVER',
      entityId: handover.id,
      req,
      details: { githubRepo: data.githubRepo }
    });

    return handover;
  }

  async getHandoverByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to project handover details.');
    }

    const handover = await handoverRepo.findByProjectId(projectId);
    if (!handover) {
      throw ApiError.notFound('Handover package not yet created for this project.');
    }
    return handover;
  }

  async updateChecklist(projectId, data, user, req) {
    const handover = await handoverRepo.findByProjectId(projectId);
    if (!handover) {
      throw ApiError.notFound('Handover not found.');
    }

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Only developers or administrators can update the handover checklist.');
    }

    const updated = await handoverRepo.updateChecklist(projectId, data);

    await recordAuditLog({
      userId: user.id,
      action: 'HANDOVER_CHECKLIST_UPDATED',
      entityType: 'HANDOVER',
      entityId: handover.id,
      req,
      details: data
    });

    return updated;
  }

  async signoff(projectId, { roleType }, user, req) {
    const handover = await handoverRepo.findByProjectId(projectId);
    if (!handover) {
      throw ApiError.notFound('Handover not found.');
    }

    let updated;
    if (roleType === 'DEVELOPER') {
      if (user.role !== ROLES.ADMIN && handover.developer_id !== user.id) {
        throw ApiError.forbidden('Only the assigned developer can sign off as developer.');
      }
      updated = await handoverRepo.signoffDeveloper(projectId);
    } else if (roleType === 'CLIENT') {
      if (user.role !== ROLES.ADMIN && handover.client_id !== user.id) {
        throw ApiError.forbidden('Only the project client can sign off as client.');
      }
      updated = await handoverRepo.signoffClient(projectId);

      // If developer has also signed off, mark project as COMPLETED
      if (updated.developer_signoff_at) {
        await db.query(
          `UPDATE projects SET status = 'COMPLETED', completion_date = CURRENT_DATE WHERE id = $1`,
          [projectId]
        );
      }
    }

    await recordAuditLog({
      userId: user.id,
      action: `HANDOVER_SIGNOFF_${roleType}`,
      entityType: 'HANDOVER',
      entityId: handover.id,
      req
    });

    return updated;
  }
}

module.exports = new HandoverService();
