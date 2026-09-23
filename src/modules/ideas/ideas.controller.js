/**
 * MVPLaunch NG - Ideas Controller
 */
const ideasService = require('./ideas.service');
const ApiResponse = require('../../utils/apiResponse');

class IdeasController {
  async submitIdea(req, res, next) {
    try {
      const idea = await ideasService.submitIdea(req.user.id, req.body, req);
      return ApiResponse.created(res, 'Idea submitted successfully for evaluation', { idea });
    } catch (error) {
      next(error);
    }
  }

  async getMyIdeas(req, res, next) {
    try {
      const { ideas, pagination } = await ideasService.getMyIdeas(req.user.id, req.query);
      return ApiResponse.paginated(res, 'Ideas retrieved', ideas, pagination);
    } catch (error) {
      next(error);
    }
  }

  async listAllIdeas(req, res, next) {
    try {
      const { ideas, pagination } = await ideasService.listAllIdeas(req.query);
      return ApiResponse.paginated(res, 'All ideas retrieved', ideas, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getIdeaById(req, res, next) {
    try {
      const idea = await ideasService.getIdeaById(req.params.id, req.user);
      return ApiResponse.success(res, 'Idea retrieved', { idea });
    } catch (error) {
      next(error);
    }
  }

  async updateIdeaStatus(req, res, next) {
    try {
      const updated = await ideasService.updateIdeaStatus(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Idea status updated', { idea: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IdeasController();
