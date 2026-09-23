/**
 * MVPLaunch NG - Scope Routes
 */
const { Router } = require('express');
const scopeController = require('./scope.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  problemClarificationSchema,
  customerDefinitionSchema,
  mvpScopeSchema
} = require('./scope.validation');

const router = Router();

router.use(authenticate);

// Problem clarification
router.post('/problem', validate({ body: problemClarificationSchema }), scopeController.clarifyProblem);

// Customer definition
router.post('/customer', validate({ body: customerDefinitionSchema }), scopeController.defineCustomer);

// MVP scope
router.post('/mvp', validate({ body: mvpScopeSchema }), scopeController.defineMvpScope);

// Full bundle by idea ID
router.get('/idea/:ideaId', scopeController.getScopeBundle);

module.exports = router;
