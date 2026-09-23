/**
 * MVPLaunch NG - Handover Controller
 */
const handoverService = require('./handover.service');
const ApiResponse = require('../../utils/apiResponse');

class HandoverController {
  async initiateHandover(req, res, next) {
    try {
      const handover = await handoverService.initiateHandover(req.user, req.body, req);
      return ApiResponse.created(res, 'GitHub handover package initiated', { handover });
    } catch (error) {
      next(error);
    }
  }

  async getHandoverByProject(req, res, next) {
    try {
      const handover = await handoverService.getHandoverByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Handover details retrieved', { handover });
    } catch (error) {
      next(error);
    }
  }

  async updateChecklist(req, res, next) {
    try {
      const updated = await handoverService.updateChecklist(req.params.projectId, req.body, req.user, req);
      return ApiResponse.success(res, 'Handover checklist updated', { handover: updated });
    } catch (error) {
      next(error);
    }
  }

  async signoff(req, res, next) {
    try {
      const updated = await handoverService.signoff(req.params.projectId, req.body, req.user, req);
      return ApiResponse.success(res, 'Handover sign-off recorded successfully', { handover: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HandoverController();
