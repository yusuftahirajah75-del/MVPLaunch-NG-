/**
 * MVPLaunch NG - Users Routes
 */
const { Router } = require('express');
const usersController = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  updateProfileSchema,
  toggleStatusSchema,
  updateRoleSchema,
  createDeveloperSchema
} = require('./users.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), usersController.listUsers);
router.post('/developer', authorize(ROLES.ADMIN), validate({ body: createDeveloperSchema }), usersController.createDeveloper);
router.patch('/profile', validate({ body: updateProfileSchema }), usersController.updateProfile);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.DEVELOPER), usersController.getUserById);
router.patch('/:id/status', authorize(ROLES.ADMIN), validate({ body: toggleStatusSchema }), usersController.toggleStatus);
router.patch('/:id/role', authorize(ROLES.ADMIN), validate({ body: updateRoleSchema }), usersController.updateRole);

module.exports = router;
