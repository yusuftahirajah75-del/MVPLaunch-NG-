/**
 * MVPLaunch NG - Handover Routes
 */
const { Router } = require('express');
const handoverController = require('./handover.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  initiateHandoverSchema,
  updateHandoverStatusSchema,
  signoffHandoverSchema
} = require('./handover.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// Initiate handover (Developer/Admin)
router.post(
  '/',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: initiateHandoverSchema }),
  handoverController.initiateHandover
);

// Get handover details by project
router.get('/project/:projectId', handoverController.getHandoverByProject);

// Update checklist (Developer/Admin)
router.patch(
  '/project/:projectId/checklist',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: updateHandoverStatusSchema }),
  handoverController.updateChecklist
);

// Signoff (Developer or Client)
router.post(
  '/project/:projectId/signoff',
  validate({ body: signoffHandoverSchema }),
  handoverController.signoff
);

module.exports = router;
