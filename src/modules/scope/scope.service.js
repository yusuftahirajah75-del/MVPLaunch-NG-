/**
 * MVPLaunch NG - Scope, Problem & Customer Service
 */
const scopeRepo = require('./scope.repository');
const ideasRepo = require('../ideas/ideas.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class ScopeService {
  async _checkIdeaAccess(ideaId, user) {
    const idea = await ideasRepo.findById(ideaId);
    if (!idea) {
      throw ApiError.notFound('Associated idea not found.');
    }
    if (user.role === ROLES.CLIENT && idea.client_id !== user.id) {
      throw ApiError.forbidden('You do not have permission to modify this idea.');
    }
    return idea;
  }

  async clarifyProblem(data, user, req) {
    await this._checkIdeaAccess(data.ideaId, user);
    const reviewedBy = user.role !== ROLES.CLIENT ? user.id : null;
    const result = await scopeRepo.upsertProblemClarification({ ...data, reviewedBy });

    await recordAuditLog({
      userId: user.id,
      action: 'PROBLEM_CLARIFIED',
      entityType: 'PROBLEM_CLARIFICATION',
      entityId: result.id,
      req,
      details: { ideaId: data.ideaId }
    });

    return result;
  }

  async defineCustomer(data, user, req) {
    await this._checkIdeaAccess(data.ideaId, user);
    const result = await scopeRepo.upsertCustomerDefinition(data);

    await recordAuditLog({
      userId: user.id,
      action: 'CUSTOMER_DEFINED',
      entityType: 'CUSTOMER_DEFINITION',
      entityId: result.id,
      req,
      details: { ideaId: data.ideaId }
    });

    return result;
  }

  async defineMvpScope(data, user, req) {
    await this._checkIdeaAccess(data.ideaId, user);
    const result = await scopeRepo.upsertMvpScope(data);

    await recordAuditLog({
      userId: user.id,
      action: 'MVP_SCOPE_DEFINED',
      entityType: 'MVP_SCOPE',
      entityId: result.id,
      req,
      details: { ideaId: data.ideaId, complexity: data.complexityRating }
    });

    return result;
  }

  async getFullScopeBundle(ideaId, user) {
    await this._checkIdeaAccess(ideaId, user);
    const [problem, customer, scope] = await Promise.all([
      scopeRepo.getProblemByIdeaId(ideaId),
      scopeRepo.getCustomerByIdeaId(ideaId),
      scopeRepo.getScopeByIdeaId(ideaId)
    ]);

    return {
      ideaId,
      problemClarification: problem,
      customerDefinition: customer,
      mvpScope: scope
    };
  }
}

module.exports = new ScopeService();
