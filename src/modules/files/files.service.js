/**
 * MVPLaunch NG - Files Service
 */
const filesRepo = require('./files.repository');
const projectsRepo = require('../projects/projects.repository');
const { localStorageProvider } = require('../../providers/storage/local.storage.provider');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class FilesService {
  async uploadFile(user, file, body, req) {
    if (!file) {
      throw ApiError.badRequest('No file provided for upload.');
    }

    if (body.projectId) {
      const project = await projectsRepo.findById(body.projectId);
      if (!project) {
        throw ApiError.notFound('Project not found.');
      }
      if (
        user.role === ROLES.CLIENT && project.client_id !== user.id ||
        user.role === ROLES.DEVELOPER && project.developer_id !== user.id
      ) {
        throw ApiError.forbidden('Unauthorized access to upload file to this project.');
      }
    }

    const fileUrl = localStorageProvider.getFileUrl(file.filename);
    const savedFile = await filesRepo.create({
      projectId: body.projectId,
      uploaderId: user.id,
      fileName: file.originalname,
      fileUrl,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      fileCategory: body.fileCategory || 'SPEC'
    });

    await recordAuditLog({
      userId: user.id,
      action: 'FILE_UPLOADED',
      entityType: 'FILE',
      entityId: savedFile.id,
      req,
      details: { fileName: savedFile.file_name, category: savedFile.file_category }
    });

    return savedFile;
  }

  async getFilesByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to project files.');
    }

    return filesRepo.findByProjectId(projectId);
  }

  async deleteFile(id, user, req) {
    const file = await filesRepo.findById(id);
    if (!file) {
      throw ApiError.notFound('File not found.');
    }

    if (user.role !== ROLES.ADMIN && file.uploader_id !== user.id) {
      throw ApiError.forbidden('Only the uploader or an admin can delete this file.');
    }

    const filename = file.file_url.split('/').pop();
    await localStorageProvider.deleteFile(filename);
    await filesRepo.delete(id);

    await recordAuditLog({
      userId: user.id,
      action: 'FILE_DELETED',
      entityType: 'FILE',
      entityId: id,
      req
    });

    return { message: 'File deleted successfully.' };
  }
}

module.exports = new FilesService();
