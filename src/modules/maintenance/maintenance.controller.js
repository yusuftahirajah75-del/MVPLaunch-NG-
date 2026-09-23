/**
 * MVPLaunch NG - Maintenance Controller
 */
const maintenanceService = require('./maintenance.service');
const ApiResponse = require('../../utils/apiResponse');

class MaintenanceController {
  async subscribe(req, res, next) {
    try {
      const subscription = await maintenanceService.subscribe(req.user, req.body, req);
      return ApiResponse.created(res, 'Maintenance subscription activated', { subscription });
    } catch (error) {
      next(error);
    }
  }

  async getMySubscriptions(req, res, next) {
    try {
      const subscriptions = await maintenanceService.getMySubscriptions(req.user.id);
      return ApiResponse.success(res, 'Maintenance subscriptions retrieved', { subscriptions });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const updated = await maintenanceService.updateStatus(req.params.id, req.body.status, req.user, req);
      return ApiResponse.success(res, 'Maintenance subscription status updated', { subscription: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
