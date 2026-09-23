/**
 * MVPLaunch NG - Orders Controller
 */
const ordersService = require('./orders.service');
const ApiResponse = require('../../utils/apiResponse');

class OrdersController {
  async getOrderById(req, res, next) {
    try {
      const order = await ordersService.getOrderById(req.params.id, req.user);
      return ApiResponse.success(res, 'Order details retrieved', { order });
    } catch (error) {
      next(error);
    }
  }

  async listMyOrders(req, res, next) {
    try {
      const { orders, pagination } = await ordersService.listMyOrders(req.user, req.query);
      return ApiResponse.paginated(res, 'Orders retrieved', orders, pagination);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const updated = await ordersService.updateOrderStatus(req.params.id, req.body.status, req.user, req);
      return ApiResponse.success(res, 'Order status updated', { order: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrdersController();
