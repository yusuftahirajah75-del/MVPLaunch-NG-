/**
 * MVPLaunch NG - Users Routes
 */
const { Router } = require('express');
const usersController = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { updateProfileSchema, toggleStatusSchema } = require('./users.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), usersController.listUsers);
router.patch('/profile', validate({ body: updateProfileSchema }), usersController.updateProfile);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.DEVELOPER), usersController.getUserById);
router.patch('/:id/status', authorize(ROLES.ADMIN), validate({ body: toggleStatusSchema }), usersController.toggleStatus);

module.exports = router;
