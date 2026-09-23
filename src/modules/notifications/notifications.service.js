/**
 * MVPLaunch NG - Notifications Service
 */
const notificationsRepo = require('./notifications.repository');

class NotificationsService {
  async getMyNotifications(userId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { notifications, total, unreadCount } = await notificationsRepo.findByUser(userId, { limit, offset });
    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total }
    };
  }

  async markAsRead(id, userId) {
    return notificationsRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId) {
    await notificationsRepo.markAllAsRead(userId);
    return { message: 'All notifications marked as read.' };
  }
}

module.exports = new NotificationsService();
