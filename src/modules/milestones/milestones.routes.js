/**
 * MVPLaunch NG - Milestones Routes
 */
const { Router } = require('express');
const milestonesController = require('./milestones.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createMilestoneSchema } = require('./milestones.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// Create milestone (Developer/Admin)
router.post(
  '/',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: createMilestoneSchema }),
  milestonesController.createMilestone
);

// Get by project
router.get('/project/:projectId', milestonesController.getMilestonesByProject);

// Get details
router.get('/:id', milestonesController.getMilestoneById);

// Submit for review (Developer)
router.post('/:id/submit', authorize(ROLES.DEVELOPER, ROLES.ADMIN), milestonesController.submitMilestone);

// Approve milestone (Client or Admin)
router.post('/:id/approve', authorize(ROLES.CLIENT, ROLES.ADMIN), milestonesController.approveMilestone);

module.exports = router;
