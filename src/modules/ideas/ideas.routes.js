/**
 * MVPLaunch NG - Ideas Routes
 */
const { Router } = require('express');
const ideasController = require('./ideas.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createIdeaSchema, updateIdeaStatusSchema } = require('./ideas.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

// Client submits idea & views own ideas
router.post('/', authorize(ROLES.CLIENT), validate({ body: createIdeaSchema }), ideasController.submitIdea);
router.get('/my', authorize(ROLES.CLIENT), ideasController.getMyIdeas);

// Admin & Developer review all submitted ideas
router.get('/', authorize(ROLES.ADMIN, ROLES.DEVELOPER), ideasController.listAllIdeas);

// View idea details
router.get('/:id', ideasController.getIdeaById);

// Admin & Developer update idea evaluation status
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.DEVELOPER), validate({ body: updateIdeaStatusSchema }), ideasController.updateIdeaStatus);

module.exports = router;
