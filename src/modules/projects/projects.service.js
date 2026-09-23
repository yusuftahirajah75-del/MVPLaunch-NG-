/**
 * MVPLaunch NG - Projects Service
 */
const projectsRepo = require('./projects.repository');
const ideasRepo = require('../ideas/ideas.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .substring(0, 180) + '-' + Date.now().toString(36);
}

class ProjectsService {
  async createProject(user, data, req) {
    let clientId = user.id;

    if (data.ideaId) {
      const idea = await ideasRepo.findById(data.ideaId);
      if (!idea) {
        throw ApiError.notFound('Referenced idea does not exist.');
      }
      if (user.role === ROLES.CLIENT && idea.client_id !== user.id) {
        throw ApiError.forbidden('You can only create projects from your own ideas.');
      }
      clientId = idea.client_id;
    }

    const slug = slugify(data.title);
    const project = await projectsRepo.create({
      ideaId: data.ideaId,
      clientId,
      developerId: user.role === ROLES.DEVELOPER ? user.id : null,
      title: data.title,
      slug,
      description: data.description,
      targetDeliveryDate: data.targetDeliveryDate
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project.id,
      req,
      details: { title: project.title, slug: project.slug }
    });

    return project;
  }

  async listProjects(user, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { projects, total } = await projectsRepo.findByUser({
      userId: user.id,
      role: user.role,
      status: query.status,
      limit,
      offset
    });

    return { projects, pagination: { page, limit, total } };
  }

  async getProjectById(id, user) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('You do not have permission to view this project.');
    }

    return project;
  }

  async updateProjectStatus(id, updateData, user, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT ||
      (user.role === ROLES.DEVELOPER && project.developer_id !== user.id)
    ) {
      throw ApiError.forbidden('Only the assigned developer or an admin can update project status.');
    }

    const updated = await projectsRepo.updateStatus(id, updateData);

    await recordAuditLog({
      userId: user.id,
      action: 'PROJECT_STATUS_UPDATED',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: { oldStatus: project.status, newStatus: updateData.status }
    });

    return updated;
  }

  async assignDeveloper(id, developerId, adminUser, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    const updated = await projectsRepo.assignDeveloper(id, developerId);

    await recordAuditLog({
      userId: adminUser.id,
      action: 'DEVELOPER_ASSIGNED_TO_PROJECT',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: { developerId }
    });

    return updated;
  }
}

module.exports = new ProjectsService();
