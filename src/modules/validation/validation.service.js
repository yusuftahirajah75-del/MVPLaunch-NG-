/**
 * MVPLaunch NG - Validation Service
 */
const validationRepo = require('./validation.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class ValidationService {
  async recordValidation(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to record validation for this project.');
    }

    const report = await validationRepo.create(data);

    await recordAuditLog({
      userId: user.id,
      action: 'VALIDATION_REPORT_CREATED',
      entityType: 'USER_VALIDATION',
      entityId: report.id,
      req,
      details: { phase: data.testingPhase, testers: data.totalTesters, nps: data.netPromoterScore }
    });

    return report;
  }

  async getValidationsByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to project validations.');
    }

    return validationRepo.findByProjectId(projectId);
  }
}

module.exports = new ValidationService();
