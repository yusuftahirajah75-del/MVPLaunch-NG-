/**
 * MVPLaunch NG - Projects Controller
 * Complete request handling for Project Lifecycle
 */
const projectsService = require('./projects.service');
const ApiResponse = require('../../utils/apiResponse');

class ProjectsController {
  async submitProject(req, res, next) {
    try {
      const project = await projectsService.submitProject(req.user, req.body, req);
      return ApiResponse.created(res, 'Project brief submitted successfully! Tracking code assigned.', { project });
    } catch (error) {
      next(error);
    }
  }

  async createProject(req, res, next) {
    try {
      const project = await projectsService.submitProject(req.user, req.body, req);
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

  async getProjectByCode(req, res, next) {
    try {
      const project = await projectsService.getProjectByCode(req.params.code, req.user);
      return ApiResponse.success(res, 'Project record found', { project });
    } catch (error) {
      next(error);
    }
  }

  async updateScope(req, res, next) {
    try {
      const updated = await projectsService.updateScope(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Project technical scope updated', { project: updated });
    } catch (error) {
      next(error);
    }
  }

  async assignEngineer(req, res, next) {
    try {
      const updated = await projectsService.assignEngineer(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Software engineer assigned successfully', { project: updated });
    } catch (error) {
      next(error);
    }
  }

  async acceptProject(req, res, next) {
    try {
      const updated = await projectsService.acceptProject(req.params.id, req.user, req);
      return ApiResponse.success(res, 'Project accepted for development', { project: updated });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req, res, next) {
    try {
      const updated = await projectsService.updateProgress(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Development progress updated', { project: updated });
    } catch (error) {
      next(error);
    }
  }

  async submitDeliverable(req, res, next) {
    try {
      const deliverable = await projectsService.submitDeliverable(req.params.id, req.body, req.user, req);
      return ApiResponse.created(res, 'Deliverable submitted for Admin review', { deliverable });
    } catch (error) {
      next(error);
    }
  }

  async reviewDeliverable(req, res, next) {
    try {
      const reviewed = await projectsService.reviewDeliverable(req.params.deliverableId, req.body, req.user, req);
      return ApiResponse.success(res, 'Deliverable review saved', { deliverable: reviewed });
    } catch (error) {
      next(error);
    }
  }

  async markDelivered(req, res, next) {
    try {
      const project = await projectsService.markProjectDelivered(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Project marked as delivered to client', { project });
    } catch (error) {
      next(error);
    }
  }

  async addNote(req, res, next) {
    try {
      const note = await projectsService.addNote(req.params.id, req.body, req.user, req);
      return ApiResponse.created(res, 'Project communication note posted', { note });
    } catch (error) {
      next(error);
    }
  }

  async getNotes(req, res, next) {
    try {
      const notes = await projectsService.getNotes(req.params.id, req.user);
      return ApiResponse.success(res, 'Project notes retrieved', { notes });
    } catch (error) {
      next(error);
    }
  }

  async listEngineers(req, res, next) {
    try {
      const engineers = await projectsService.listEngineers();
      return ApiResponse.success(res, 'Available software engineers retrieved', { engineers });
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
}

module.exports = new ProjectsController();
