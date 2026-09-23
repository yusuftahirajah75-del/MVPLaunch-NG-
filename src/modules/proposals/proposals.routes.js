/**
 * MVPLaunch NG - Proposals Routes
 */
const { Router } = require('express');
const proposalsController = require('./proposals.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createProposalSchema, respondProposalSchema } = require('./proposals.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// Create proposal (Developer/Admin)
router.post(
  '/',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: createProposalSchema }),
  proposalsController.createProposal
);

// View proposals for a project
router.get('/project/:projectId', proposalsController.getProposalsByProject);

// View proposal details
router.get('/:id', proposalsController.getProposalById);

// Respond to proposal (Accept/Decline)
router.post(
  '/:id/respond',
  validate({ body: respondProposalSchema }),
  proposalsController.respondProposal
);

module.exports = router;
