/**
 * MVPLaunch NG - Master API v1 Router
 */
const { Router } = require('express');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const ideasRoutes = require('./modules/ideas/ideas.routes');
const scopeRoutes = require('./modules/scope/scope.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const proposalsRoutes = require('./modules/proposals/proposals.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const milestonesRoutes = require('./modules/milestones/milestones.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const filesRoutes = require('./modules/files/files.routes');
const messagesRoutes = require('./modules/messages/messages.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const deploymentsRoutes = require('./modules/deployments/deployments.routes');
const handoverRoutes = require('./modules/handover/handover.routes');
const validationRoutes = require('./modules/validation/validation.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const packagesRoutes = require('./modules/packages/packages.routes');
const { router: adminRoutes } = require('./modules/admin/admin.routes');
const { router: auditRoutes } = require('./modules/audit/audit.routes');

const ApiResponse = require('./utils/apiResponse');

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  return ApiResponse.success(res, 'MVPLaunch NG Backend API is active and healthy', {
    service: 'MVPLaunch NG API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// Mount modular sub-routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/ideas', ideasRoutes);
apiRouter.use('/scope', scopeRoutes);
apiRouter.use('/projects', projectsRoutes);
apiRouter.use('/proposals', proposalsRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/milestones', milestonesRoutes);
apiRouter.use('/tasks', tasksRoutes);
apiRouter.use('/files', filesRoutes);
apiRouter.use('/messages', messagesRoutes);
apiRouter.use('/payments', paymentsRoutes);
apiRouter.use('/packages', packagesRoutes);
apiRouter.use('/deployments', deploymentsRoutes);
apiRouter.use('/handover', handoverRoutes);
apiRouter.use('/validation', validationRoutes);
apiRouter.use('/maintenance', maintenanceRoutes);
apiRouter.use('/reviews', reviewsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/audit-logs', auditRoutes);

module.exports = apiRouter;
