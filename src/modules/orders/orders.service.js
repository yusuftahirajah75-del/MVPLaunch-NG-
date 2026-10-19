/**
 * MVPLaunch NG - Orders Service
 */
const ordersRepo = require('./orders.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class OrdersService {
  async getOrderById(id, user) {
    const order = await ordersRepo.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    // Role-based tenant isolation
    if (user.role === ROLES.CLIENT && order.client_id !== user.id) {
      throw ApiError.forbidden('You do not have permission to access another client\'s order.');
    }

    if (user.role === ROLES.DEVELOPER) {
      throw ApiError.forbidden('Software engineers do not have permission to access client financial orders.');
    }

    return order;
  }

  async listMyOrders(user, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    if (user.role === ROLES.DEVELOPER) {
      return { orders: [], pagination: { page, limit, total: 0 } };
    }

    const { orders, total } = await ordersRepo.findByUser(user.id, user.role, { limit, offset });
    return { orders, pagination: { page, limit, total } };
  }

  async updateOrderStatus(id, status, user, req) {
    const order = await ordersRepo.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    const updated = await ordersRepo.updateStatus(id, status);

    await recordAuditLog({
      userId: user.id,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'ORDER',
      entityId: id,
      req,
      details: { oldStatus: order.status, newStatus: status }
    });

    return updated;
  }
}

module.exports = new OrdersService();
