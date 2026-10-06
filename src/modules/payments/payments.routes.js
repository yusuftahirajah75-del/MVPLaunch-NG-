/**
 * MVPLaunch NG - Payments Routes
 */
const { Router } = require('express');
const paymentsController = require('./payments.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  initializePaymentSchema,
  initializePackagePaymentSchema,
  verifyPaymentSchema
} = require('./payments.validation');

const router = Router();

// 1. Webhook endpoint (Public, called by Paystack servers with HMAC SHA512 signature)
router.post('/webhook', paymentsController.webhook);

// 2. Mock Checkout UI (Development only)
router.get('/mock-checkout', paymentsController.mockCheckout);

// 3. Package Checkout initialization (Public / Optional Auth for visitors or logged in clients)
router.post(
  '/initialize-package',
  optionalAuth,
  validate({ body: initializePackagePaymentSchema }),
  paymentsController.initializePackagePayment
);

// 4. Verification endpoints (Public callback verification by reference)
router.get('/verify/:reference', paymentsController.verifyPayment);
router.post(
  '/verify',
  validate({ body: verifyPaymentSchema }),
  paymentsController.verifyPayment
);

// 5. Protected endpoints (Require authenticated session)
router.use(authenticate);

router.post(
  '/initialize',
  validate({ body: initializePaymentSchema }),
  paymentsController.initializePayment
);
router.get('/my', paymentsController.getMyPayments);

module.exports = router;
