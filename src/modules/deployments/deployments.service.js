/**
 * MVPLaunch NG - Deployments Service
 */
const deploymentsRepo = require('./deployments.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');
const db = require('../../config/db');

class DeploymentsService {
  async recordDeployment(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Only developers or administrators can record deployments.');
    }

    const deployment = await deploymentsRepo.create({
      ...data,
      deployedBy: user.id
    });

    // Auto-update project staging or production URL
    if (data.status === 'LIVE') {
      if (data.environment === 'STAGING') {
        await db.query('UPDATE projects SET staging_url = $1 WHERE id = $2', [data.deploymentUrl, data.projectId]);
      } else if (data.environment === 'PRODUCTION') {
        await db.query('UPDATE projects SET production_url = $1 WHERE id = $2', [data.deploymentUrl, data.projectId]);
      }
    }

    await recordAuditLog({
      userId: user.id,
      action: 'DEPLOYMENT_RECORDED',
      entityType: 'DEPLOYMENT',
      entityId: deployment.id,
      req,
      details: { environment: data.environment, url: data.deploymentUrl }
    });

    return deployment;
  }

  async getDeploymentsByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to project deployments.');
    }

    return deploymentsRepo.findByProjectId(projectId);
  }
}

module.exports = new DeploymentsService();
