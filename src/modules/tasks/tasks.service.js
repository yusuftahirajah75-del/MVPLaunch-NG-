/**
 * MVPLaunch NG - Tasks Service
 */
const tasksRepo = require('./tasks.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class TasksService {
  async createTask(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Clients cannot create technical tasks directly.');
    }

    if (user.role === ROLES.DEVELOPER && project.developer_id !== user.id) {
      throw ApiError.forbidden('You can only create tasks for projects explicitly assigned to you.');
    }

    const task = await tasksRepo.create(data);

    await recordAuditLog({
      userId: user.id,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task.id,
      req,
      details: { title: task.title, milestoneId: task.milestone_id, projectId: data.projectId }
    });

    return task;
  }

  async getTasksByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      (user.role === ROLES.CLIENT && project.client_id !== user.id) ||
      (user.role === ROLES.DEVELOPER && project.developer_id !== user.id)
    ) {
      throw ApiError.forbidden('Unauthorized access to project tasks.');
    }

    return tasksRepo.findByProjectId(projectId);
  }

  async updateTask(id, updateData, user, req) {
    const task = await tasksRepo.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }

    const project = await projectsRepo.findById(task.project_id);

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Clients cannot update task statuses.');
    }

    if (user.role === ROLES.DEVELOPER && (!project || project.developer_id !== user.id)) {
      throw ApiError.forbidden('You can only update tasks for projects explicitly assigned to you.');
    }

    const updated = await tasksRepo.update(id, updateData);

    await recordAuditLog({
      userId: user.id,
      action: 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: id,
      req,
      details: { oldStatus: task.status, newStatus: updateData.status }
    });

    return updated;
  }

  async deleteTask(id, user, req) {
    const task = await tasksRepo.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }

    const project = await projectsRepo.findById(task.project_id);

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Clients cannot delete tasks.');
    }

    if (user.role === ROLES.DEVELOPER && (!project || project.developer_id !== user.id)) {
      throw ApiError.forbidden('You can only delete tasks for projects explicitly assigned to you.');
    }

    await tasksRepo.delete(id);

    await recordAuditLog({
      userId: user.id,
      action: 'TASK_DELETED',
      entityType: 'TASK',
      entityId: id,
      req
    });

    return { message: 'Task deleted successfully.' };
  }
}

module.exports = new TasksService();
