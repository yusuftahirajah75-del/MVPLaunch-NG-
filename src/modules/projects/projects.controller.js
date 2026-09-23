/**
 * MVPLaunch NG - Projects Controller
 */
const projectsService = require('./projects.service');
const ApiResponse = require('../../utils/apiResponse');

class ProjectsController {
  async createProject(req, res, next) {
    try {
      const project = await projectsService.createProject(req.user, req.body, req);
      return ApiResponse.created(res, 'Project initiated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async listProjects(req, res, next) {
    try {
      const { projects, pagination } = await projectsService.listProjects(req.user, req.query);
      return ApiResponse.paginated(res, 'Projects retrieved', projects, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const project = await projectsService.getProjectById(req.params.id, req.user);
      return ApiResponse.success(res, 'Project details retrieved', { project });
    } catch (error) {
      next(error);
    }
  }

  async updateProjectStatus(req, res, next) {
    try {
      const updated = await projectsService.updateProjectStatus(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Project status updated', { project: updated });
    } catch (error) {
      next(error);
    }
  }

  async assignDeveloper(req, res, next) {
    try {
      const updated = await projectsService.assignDeveloper(req.params.id, req.body.developerId, req.user, req);
      return ApiResponse.success(res, 'Developer assigned successfully to project', { project: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectsController();
