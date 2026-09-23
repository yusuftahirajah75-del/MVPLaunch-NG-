/**
 * MVPLaunch NG - Proposals Controller
 */
const proposalsService = require('./proposals.service');
const ApiResponse = require('../../utils/apiResponse');

class ProposalsController {
  async createProposal(req, res, next) {
    try {
      const proposal = await proposalsService.createProposal(req.user, req.body, req);
      return ApiResponse.created(res, 'Project proposal created successfully', { proposal });
    } catch (error) {
      next(error);
    }
  }

  async getProposalsByProject(req, res, next) {
    try {
      const proposals = await proposalsService.getProposalsByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Proposals retrieved', { proposals });
    } catch (error) {
      next(error);
    }
  }

  async getProposalById(req, res, next) {
    try {
      const proposal = await proposalsService.getProposalById(req.params.id, req.user);
      return ApiResponse.success(res, 'Proposal retrieved', { proposal });
    } catch (error) {
      next(error);
    }
  }

  async respondProposal(req, res, next) {
    try {
      const result = await proposalsService.respondToProposal(req.params.id, req.body.action, req.user, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProposalsController();
