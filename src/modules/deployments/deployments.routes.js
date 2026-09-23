/**
 * MVPLaunch NG - Deployments Routes
 */
const { Router } = require('express');
const deploymentsController = require('./deployments.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createDeploymentSchema } = require('./deployments.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: createDeploymentSchema }),
  deploymentsController.recordDeployment
);

router.get('/project/:projectId', deploymentsController.getDeploymentsByProject);

module.exports = router;
