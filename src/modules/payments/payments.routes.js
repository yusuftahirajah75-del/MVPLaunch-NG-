/**
 * MVPLaunch NG - Payments Routes
 */
const { Router } = require('express');
const paymentsController = require('./payments.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { initializePaymentSchema, verifyPaymentSchema } = require('./payments.validation');

const router = Router();

// Webhook endpoint (Public, called by Paystack servers with cryptographic signature)
router.post('/webhook', paymentsController.webhook);

// Mock Checkout UI (Development only)
router.get('/mock-checkout', paymentsController.mockCheckout);

// Protected endpoints
router.use(authenticate);

router.post('/initialize', validate({ body: initializePaymentSchema }), paymentsController.initializePayment);
router.post('/verify', validate({ body: verifyPaymentSchema }), paymentsController.verifyPayment);
router.get('/my', paymentsController.getMyPayments);

module.exports = router;
