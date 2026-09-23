/**
 * MVPLaunch NG - Orders Routes
 */
const { Router } = require('express');
const ordersController = require('./orders.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { updateOrderStatusSchema } = require('./orders.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

router.get('/', ordersController.listMyOrders);
router.get('/:id', ordersController.getOrderById);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN),
  validate({ body: updateOrderStatusSchema }),
  ordersController.updateOrderStatus
);

module.exports = router;
