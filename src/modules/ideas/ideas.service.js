/**
 * MVPLaunch NG - Ideas Service
 */
const ideasRepo = require('./ideas.repository');
const ApiError = require('../../utils/apiError');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');
const { ROLES } = require('../../config/constants');

class IdeasService {
  async submitIdea(clientId, ideaData, req) {
    const idea = await ideasRepo.create({ clientId, ...ideaData });
    await recordAuditLog({
      userId: clientId,
      action: 'IDEA_SUBMITTED',
      entityType: 'IDEA',
      entityId: idea.id,
      req,
      details: { title: idea.title }
    });
    return idea;
  }

  async getIdeaById(id, user) {
    const idea = await ideasRepo.findById(id);
    if (!idea) {
      throw ApiError.notFound('Idea not found.');
    }

    // Authorization: Client can only view their own ideas; Developer & Admin can view any
    if (user.role === ROLES.CLIENT && idea.client_id !== user.id) {
      throw ApiError.forbidden('You are not authorized to view this idea submission.');
    }

    return idea;
  }

  async getMyIdeas(clientId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { ideas, total } = await ideasRepo.findByClientId(clientId, { limit, offset });
    return { ideas, pagination: { page, limit, total } };
  }

  async listAllIdeas(query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { ideas, total } = await ideasRepo.findAll({
      status: query.status,
      limit,
      offset
    });
    return { ideas, pagination: { page, limit, total } };
  }

  async updateIdeaStatus(id, { status, adminNotes }, reviewerUser, req) {
    const idea = await ideasRepo.findById(id);
    if (!idea) {
      throw ApiError.notFound('Idea not found.');
    }

    const updated = await ideasRepo.updateStatus(id, { status, adminNotes });
    await recordAuditLog({
      userId: reviewerUser.id,
      action: 'IDEA_STATUS_UPDATED',
      entityType: 'IDEA',
      entityId: id,
      req,
      details: { oldStatus: idea.status, newStatus: status, adminNotes }
    });

    return updated;
  }
}

module.exports = new IdeasService();
