/**
 * MVPLaunch NG - Admin Controller & Routes
 */
const { Router } = require('express');
const adminService = require('./admin.service');
const ApiResponse = require('../../utils/apiResponse');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { ROLES } = require('../../config/constants');

class AdminController {
  async getMetrics(req, res, next) {
    try {
      const metrics = await adminService.getDashboardMetrics();
      return ApiResponse.success(res, 'Admin metrics aggregated successfully', { metrics });
    } catch (error) {
      next(error);
    }
  }

  async getHealth(req, res, next) {
    try {
      const health = await adminService.getSystemHealth();
      return ApiResponse.success(res, 'System health status retrieved', { health });
    } catch (error) {
      next(error);
    }
  }
}

const adminController = new AdminController();
const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/metrics', adminController.getMetrics);
router.get('/health', adminController.getHealth);

module.exports = {
  adminController,
  router
};
