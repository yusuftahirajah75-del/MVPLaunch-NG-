/**
 * MVPLaunch NG - Validation Routes
 */
const { Router } = require('express');
const validationController = require('./validation.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createValidationReportSchema } = require('./validation.validation');

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createValidationReportSchema }), validationController.recordValidation);
router.get('/project/:projectId', validationController.getValidationsByProject);

module.exports = router;
