/**
 * MVPLaunch NG - Deployments Controller
 */
const deploymentsService = require('./deployments.service');
const ApiResponse = require('../../utils/apiResponse');

class DeploymentsController {
  async recordDeployment(req, res, next) {
    try {
      const deployment = await deploymentsService.recordDeployment(req.user, req.body, req);
      return ApiResponse.created(res, 'Deployment recorded successfully', { deployment });
    } catch (error) {
      next(error);
    }
  }

  async getDeploymentsByProject(req, res, next) {
    try {
      const deployments = await deploymentsService.getDeploymentsByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Deployments retrieved', { deployments });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeploymentsController();
