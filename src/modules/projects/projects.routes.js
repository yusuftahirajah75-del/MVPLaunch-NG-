/**
 * MVPLaunch NG - Projects Routes
 * Production REST endpoints for full workflow lifecycle:
 * Submission, Scoping, Assignment, Development, Deliverables & Internal Communication
 */
const { Router } = require('express');
const projectsController = require('./projects.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  createProjectSchema,
  submitProjectSchema,
  updateProjectStatusSchema,
  updateScopeSchema,
  assignEngineerSchema,
  updateProgressSchema,
  submitDeliverableSchema,
  reviewDeliverableSchema,
  addNoteSchema
} = require('./projects.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// 1. Submit Project (Requires verified paid order)
router.post('/submit', validate({ body: submitProjectSchema }), projectsController.submitProject);
router.post('/', validate({ body: submitProjectSchema }), projectsController.submitProject);

// 2. Engineers List for Admin Assignment
router.get('/meta/engineers', authorize(ROLES.ADMIN), projectsController.listEngineers);

// 3. Review Deliverable (Admin)
router.patch(
  '/deliverables/:deliverableId/review',
  authorize(ROLES.ADMIN),
  validate({ body: reviewDeliverableSchema }),
  projectsController.reviewDeliverable
);

// 4. Track Project by Unique Code (PRJ-XXXX-XXXX)
router.get('/track/:code', projectsController.getProjectByCode);

// 5. List Projects (Client sees own, Engineer sees assigned, Admin sees all)
router.get('/', projectsController.listProjects);

// 6. Project Details
router.get('/:id', projectsController.getProjectById);

// 7. Admin Technical Scoping
router.patch(
  '/:id/scope',
  authorize(ROLES.ADMIN),
  validate({ body: updateScopeSchema }),
  projectsController.updateScope
);

// 8. Admin Assign / Reassign Software Engineer
router.post(
  '/:id/assign-engineer',
  authorize(ROLES.ADMIN),
  validate({ body: assignEngineerSchema }),
  projectsController.assignEngineer
);
// Legacy alias
router.post(
  '/:id/assign',
  authorize(ROLES.ADMIN),
  validate({ body: assignEngineerSchema }),
  projectsController.assignEngineer
);

// 9. Engineer Accept Task
router.post(
  '/:id/accept',
  authorize(ROLES.DEVELOPER),
  projectsController.acceptProject
);

// 10. Engineer / Admin Update Progress
router.patch(
  '/:id/progress',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: updateProgressSchema }),
  projectsController.updateProgress
);

// 11. Engineer Submit Deliverable
router.post(
  '/:id/deliverables',
  authorize(ROLES.DEVELOPER),
  validate({ body: submitDeliverableSchema }),
  projectsController.submitDeliverable
);

// 12. Admin Mark Delivered to Client
router.post(
  '/:id/deliver',
  authorize(ROLES.ADMIN),
  projectsController.markDelivered
);

// 13. Admin ↔ Engineer Project Notes / Communication
router.post(
  '/:id/notes',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: addNoteSchema }),
  projectsController.addNote
);
router.get(
  '/:id/notes',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  projectsController.getNotes
);

// 14. Update Status (Generic)
router.patch(
  '/:id/status',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: updateProjectStatusSchema }),
  projectsController.updateProjectStatus
);

module.exports = router;
