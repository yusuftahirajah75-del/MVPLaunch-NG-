/**
 * MVPLaunch NG - Milestones Service
 */
const milestonesRepo = require('./milestones.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');
const db = require('../../config/db');

class MilestonesService {
  async createMilestone(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Only developers or administrators can create milestones.');
    }

    const milestone = await milestonesRepo.create(data);

    await recordAuditLog({
      userId: user.id,
      action: 'MILESTONE_CREATED',
      entityType: 'MILESTONE',
      entityId: milestone.id,
      req,
      details: { title: milestone.title, amountNgn: milestone.amount_ngn }
    });

    return milestone;
  }

  async getMilestonesByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to project milestones.');
    }

    return milestonesRepo.findByProjectId(projectId);
  }

  async getMilestoneById(id, user) {
    const milestone = await milestonesRepo.findById(id);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found.');
    }

    if (
      user.role === ROLES.CLIENT && milestone.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && milestone.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to milestone.');
    }

    return milestone;
  }

  async submitMilestone(id, user, req) {
    const milestone = await milestonesRepo.findById(id);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found.');
    }

    if (user.role === ROLES.DEVELOPER && milestone.developer_id !== user.id) {
      throw ApiError.forbidden('Only the assigned developer can submit this milestone.');
    }

    const updated = await milestonesRepo.submitForReview(id);

    // Send notification to Client
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, metadata)
       VALUES ($1, $2, $3, 'MILESTONE_SUBMITTED', $4)`,
      [
        milestone.client_id,
        'Milestone Submitted for Review',
        `Milestone "${milestone.title}" has been submitted for your approval.`,
        JSON.stringify({ milestoneId: id, projectId: milestone.project_id })
      ]
    );

    await recordAuditLog({
      userId: user.id,
      action: 'MILESTONE_SUBMITTED_FOR_REVIEW',
      entityType: 'MILESTONE',
      entityId: id,
      req
    });

    return updated;
  }

  async approveMilestone(id, user, req) {
    const milestone = await milestonesRepo.findById(id);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found.');
    }

    if (user.role === ROLES.CLIENT && milestone.client_id !== user.id) {
      throw ApiError.forbidden('Only the project client or admin can approve this milestone.');
    }

    const updated = await milestonesRepo.approve(id);

    // Notify developer
    if (milestone.developer_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, metadata)
         VALUES ($1, $2, $3, 'MILESTONE_APPROVED', $4)`,
        [
          milestone.developer_id,
          'Milestone Approved!',
          `Milestone "${milestone.title}" has been approved by the client.`,
          JSON.stringify({ milestoneId: id, projectId: milestone.project_id })
        ]
      );
    }

    await recordAuditLog({
      userId: user.id,
      action: 'MILESTONE_APPROVED',
      entityType: 'MILESTONE',
      entityId: id,
      req,
      details: { amountNgn: milestone.amount_ngn }
    });

    return updated;
  }
}

module.exports = new MilestonesService();
