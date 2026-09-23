/**
 * MVPLaunch NG - Maintenance Routes
 */
const { Router } = require('express');
const maintenanceController = require('./maintenance.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  subscribeMaintenanceSchema,
  updateMaintenanceStatusSchema
} = require('./maintenance.validation');

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: subscribeMaintenanceSchema }), maintenanceController.subscribe);
router.get('/my', maintenanceController.getMySubscriptions);
router.patch('/:id/status', validate({ body: updateMaintenanceStatusSchema }), maintenanceController.updateStatus);

module.exports = router;
