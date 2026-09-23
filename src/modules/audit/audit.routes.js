/**
 * MVPLaunch NG - Audit Logs Service, Controller & Routes
 */
const { Router } = require('express');
const auditRepo = require('./audit.repository');
const ApiResponse = require('../../utils/apiResponse');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { ROLES } = require('../../config/constants');

class AuditService {
  async listLogs(query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const offset = (page - 1) * limit;

    const { auditLogs, total } = await auditRepo.findAll({
      userId: query.userId,
      action: query.action,
      entityType: query.entityType,
      limit,
      offset
    });

    return { auditLogs, pagination: { page, limit, total } };
  }
}

const auditService = new AuditService();

class AuditController {
  async listLogs(req, res, next) {
    try {
      const { auditLogs, pagination } = await auditService.listLogs(req.query);
      return ApiResponse.paginated(res, 'Audit logs retrieved', auditLogs, pagination);
    } catch (error) {
      next(error);
    }
  }
}

const auditController = new AuditController();

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/', auditController.listLogs);

module.exports = {
  auditService,
  auditController,
  router
};
