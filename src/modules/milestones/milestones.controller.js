/**
 * MVPLaunch NG - Milestones Controller
 */
const milestonesService = require('./milestones.service');
const ApiResponse = require('../../utils/apiResponse');

class MilestonesController {
  async createMilestone(req, res, next) {
    try {
      const milestone = await milestonesService.createMilestone(req.user, req.body, req);
      return ApiResponse.created(res, 'Milestone created successfully', { milestone });
    } catch (error) {
      next(error);
    }
  }

  async getMilestonesByProject(req, res, next) {
    try {
      const milestones = await milestonesService.getMilestonesByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Milestones retrieved', { milestones });
    } catch (error) {
      next(error);
    }
  }

  async getMilestoneById(req, res, next) {
    try {
      const milestone = await milestonesService.getMilestoneById(req.params.id, req.user);
      return ApiResponse.success(res, 'Milestone retrieved', { milestone });
    } catch (error) {
      next(error);
    }
  }

  async submitMilestone(req, res, next) {
    try {
      const milestone = await milestonesService.submitMilestone(req.params.id, req.user, req);
      return ApiResponse.success(res, 'Milestone submitted for client review', { milestone });
    } catch (error) {
      next(error);
    }
  }

  async approveMilestone(req, res, next) {
    try {
      const milestone = await milestonesService.approveMilestone(req.params.id, req.user, req);
      return ApiResponse.success(res, 'Milestone approved successfully', { milestone });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MilestonesController();
