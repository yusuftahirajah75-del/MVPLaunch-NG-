/**
 * MVPLaunch NG - Scope Controller
 */
const scopeService = require('./scope.service');
const ApiResponse = require('../../utils/apiResponse');

class ScopeController {
  async clarifyProblem(req, res, next) {
    try {
      const result = await scopeService.clarifyProblem(req.body, req.user, req);
      return ApiResponse.success(res, 'Problem & value proposition clarified successfully', { problemClarification: result });
    } catch (error) {
      next(error);
    }
  }

  async defineCustomer(req, res, next) {
    try {
      const result = await scopeService.defineCustomer(req.body, req.user, req);
      return ApiResponse.success(res, 'Target customer defined successfully', { customerDefinition: result });
    } catch (error) {
      next(error);
    }
  }

  async defineMvpScope(req, res, next) {
    try {
      const result = await scopeService.defineMvpScope(req.body, req.user, req);
      return ApiResponse.success(res, 'MVP scope & requirements configured successfully', { mvpScope: result });
    } catch (error) {
      next(error);
    }
  }

  async getScopeBundle(req, res, next) {
    try {
      const result = await scopeService.getFullScopeBundle(req.params.ideaId, req.user);
      return ApiResponse.success(res, 'Full idea scope bundle retrieved', { bundle: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScopeController();
