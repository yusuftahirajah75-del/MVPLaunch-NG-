/**
 * MVPLaunch NG - Notifications Routes
 */
const { Router } = require('express');
const notificationsController = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.getMyNotifications);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);

module.exports = router;
