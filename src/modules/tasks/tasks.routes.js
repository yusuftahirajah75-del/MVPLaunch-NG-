/**
 * MVPLaunch NG - Tasks Routes
 */
const { Router } = require('express');
const tasksController = require('./tasks.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createTaskSchema, updateTaskSchema } = require('./tasks.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// Create task (Developer/Admin)
router.post(
  '/',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: createTaskSchema }),
  tasksController.createTask
);

// Get tasks by project
router.get('/project/:projectId', tasksController.getTasksByProject);

// Update task (Developer/Admin)
router.patch(
  '/:id',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  validate({ body: updateTaskSchema }),
  tasksController.updateTask
);

// Delete task (Developer/Admin)
router.delete(
  '/:id',
  authorize(ROLES.DEVELOPER, ROLES.ADMIN),
  tasksController.deleteTask
);

module.exports = router;
