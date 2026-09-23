/**
 * MVPLaunch NG - Files Controller
 */
const filesService = require('./files.service');
const ApiResponse = require('../../utils/apiResponse');

class FilesController {
  async uploadFile(req, res, next) {
    try {
      const savedFile = await filesService.uploadFile(req.user, req.file, req.body, req);
      return ApiResponse.created(res, 'File uploaded successfully', { file: savedFile });
    } catch (error) {
      next(error);
    }
  }

  async getFilesByProject(req, res, next) {
    try {
      const files = await filesService.getFilesByProject(req.params.projectId, req.user);
      return ApiResponse.success(res, 'Files retrieved', { files });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const result = await filesService.deleteFile(req.params.id, req.user, req);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FilesController();
