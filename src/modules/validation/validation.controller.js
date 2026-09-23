/**
 * MVPLaunch NG - Validation Controller
 */
const validationService = require('./validation.service');
const ApiResponse = require('../../utils/apiResponse');

class ValidationController {
  async recordValidation(req, res, next) {
    try {
      const report = await validationService.recordValidation(req.user, req.body, req);
      return ApiResponse.created(res, 'User validation report logged successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getValidationsByProject(req, res, next) {
    try {
      const reports = await validationService.getValidationsByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Validation reports retrieved', { reports });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ValidationController();
