/**
 * MVPLaunch NG - Projects Routes
 */
const { Router } = require('express');
const projectsController = require('./projects.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  createProjectSchema,
  updateProjectStatusSchema,
  assignDeveloperSchema
} = require('./projects.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// Create project & List projects
router.post('/', validate({ body: createProjectSchema }), projectsController.createProject);
router.get('/', projectsController.listProjects);

// Details
router.get('/:id', projectsController.getProjectById);

// Update status (Developer/Admin)
router.patch(
  '/:id/status',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: updateProjectStatusSchema }),
  projectsController.updateProjectStatus
);

// Assign developer (Admin only)
router.post(
  '/:id/assign',
  authorize(ROLES.ADMIN),
  validate({ body: assignDeveloperSchema }),
  projectsController.assignDeveloper
);

module.exports = router;
