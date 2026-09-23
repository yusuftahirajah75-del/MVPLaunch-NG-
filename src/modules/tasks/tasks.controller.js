/**
 * MVPLaunch NG - Tasks Controller
 */
const tasksService = require('./tasks.service');
const ApiResponse = require('../../utils/apiResponse');

class TasksController {
  async createTask(req, res, next) {
    try {
      const task = await tasksService.createTask(req.user, req.body, req);
      return ApiResponse.created(res, 'Task created successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async getTasksByProject(req, res, next) {
    try {
      const tasks = await tasksService.getTasksByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Project tasks retrieved', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const updated = await tasksService.updateTask(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Task updated successfully', { task: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const result = await tasksService.deleteTask(req.params.id, req.user, req);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TasksController();
