/**
 * MVPLaunch NG - Notifications Controller
 */
const notificationsService = require('./notifications.service');
const ApiResponse = require('../../utils/apiResponse');

class NotificationsController {
  async getMyNotifications(req, res, next) {
    try {
      const { notifications, unreadCount, pagination } = await notificationsService.getMyNotifications(req.user.id, req.query);
      return ApiResponse.paginated(res, 'Notifications retrieved', notifications, { ...pagination, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationsService.markAsRead(req.params.id, req.user.id);
      return ApiResponse.success(res, 'Notification marked as read', { notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationsService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationsController();
