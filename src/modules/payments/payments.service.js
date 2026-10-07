/**
 * MVPLaunch NG - Payments Service
 * Secure Paystack transaction lifecycle: initialization, server verification, and webhooks.
 */
const crypto = require('crypto');
const paymentsRepo = require('./payments.repository');
const ordersRepo = require('../orders/orders.repository');
const authRepo = require('../auth/auth.repository');
const milestonesRepo = require('../milestones/milestones.repository');
const paystackProvider = require('../../providers/payment/paystack.provider');
const db = require('../../config/db');
const ApiError = require('../../utils/apiError');
const env = require('../../config/env');
const { getPackageById } = require('../../config/packages');
const { hashPassword } = require('../../utils/password');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');
const logger = require('../../utils/logger');

class PaymentsService {
  /**
   * Initialize Paystack checkout for custom milestone / project orders
   */
  async initializePayment(user, { orderId, milestoneId, amountNgn, callbackUrl }, req) {
    const order = await ordersRepo.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    if (order.client_id !== user.id) {
      throw ApiError.forbidden('You can only make payments for your own orders.');
    }

    const reference = `mvp_pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const effectiveCallback = callbackUrl || `${env.FRONTEND_URL}/payments/callback?reference=${reference}`;

    const paystackRes = await paystackProvider.initializeTransaction({
      email: user.email,
      amountNgn,
      reference,
      callbackUrl: effectiveCallback,
      metadata: {
        orderId,
        milestoneId,
        userId: user.id
      }
    });

    const payment = await paymentsRepo.create({
      orderId,
      milestoneId,
      userId: user.id,
      amountNgn,
      provider: 'PAYSTACK',
      providerReference: reference,
      status: 'INITIALIZED',
      channel: null,
      metadata: { paystackInit: paystackRes }
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PAYMENT_INITIALIZED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      req,
      details: { reference, amountNgn, orderId }
    });

    return {
      payment,
      authorizationUrl: paystackRes.authorizationUrl,
      reference
    };
  }

  /**
   * Initialize Paystack checkout for one-time package purchases (Student Starter, MVP Starter, Business Launch)
   * Server strictly enforces package pricing from trusted configuration.
   */
  async initializePackagePayment({ packageId, customerName, customerEmail, customerPhone, notes, callbackUrl }, user = null, req = null) {
    const packageDetails = getPackageById(packageId);
    if (!packageDetails) {
      throw ApiError.badRequest('Invalid package selected. Must be idea-validation, student-project, founder-mvp, or business-digital.');
    }

    // Resolve or automatically create client user account
    let clientId = user?.id || null;
    if (!clientId) {
      const existingUser = await authRepo.findByEmail(customerEmail);
      if (existingUser) {
        clientId = existingUser.id;
      } else {
        // Automatically create account so customer can sign in & track deliverables
        const randomPass = crypto.randomBytes(8).toString('hex') + 'Mvp1!';
        const passHash = await hashPassword(randomPass);
        const newUser = await authRepo.createUser({
          email: customerEmail.toLowerCase().trim(),
          passwordHash: passHash,
          fullName: customerName.trim(),
          phoneNumber: customerPhone || null,
          role: 'CLIENT'
        });
        clientId = newUser.id;
      }
    }

    // 1. Create persistent pending order in PostgreSQL
    const orderRes = await db.query(
      `INSERT INTO orders (
        client_id, order_type, package_id, package_name,
        customer_name, customer_email, customer_phone, notes,
        total_amount_ngn, payment_status, status, fulfillment_status
       )
       VALUES ($1, 'PACKAGE', $2, $3, $4, $5, $6, $7, $8, 'PENDING', 'PENDING_PAYMENT', 'PENDING')
       RETURNING *`,
      [
        clientId,
        packageDetails.id,
        packageDetails.name,
        customerName.trim(),
        customerEmail.toLowerCase().trim(),
        customerPhone || null,
        notes || null,
        packageDetails.priceNgn
      ]
    );
    const order = orderRes.rows[0];

    // 2. Generate unique, unpredictable reference
    const reference = `mvp_pkg_${packageDetails.id.replace(/-/g, '_')}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const effectiveCallback = callbackUrl || `${env.FRONTEND_URL}/payments/callback?reference=${reference}`;

    // 3. Initialize transaction with Paystack using exact trusted amount
    const paystackRes = await paystackProvider.initializeTransaction({
      email: customerEmail.toLowerCase().trim(),
      amountNgn: packageDetails.priceNgn,
      reference,
      callbackUrl: effectiveCallback,
      metadata: {
        orderId: order.id,
        packageId: packageDetails.id,
        packageName: packageDetails.name,
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone || null,
        platform: 'MVPLaunch NG'
      }
    });

    // 4. Create persistent payment record in PostgreSQL
    const payRes = await db.query(
      `INSERT INTO payments (
        order_id, user_id, amount_ngn, amount_kobo, currency,
        customer_email, provider, provider_reference, status, channel, paystack_metadata
       )
       VALUES ($1, $2, $3, $4, 'NGN', $5, 'PAYSTACK', $6, 'INITIALIZED', NULL, $7)
       RETURNING *`,
      [
        order.id,
        clientId,
        packageDetails.priceNgn,
        packageDetails.priceKobo,
        customerEmail.toLowerCase().trim(),
        reference,
        JSON.stringify({ paystackInit: paystackRes })
      ]
    );
    const payment = payRes.rows[0];

    await recordAuditLog({
      userId: clientId,
      action: 'PACKAGE_PAYMENT_INITIALIZED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      req,
      details: {
        reference,
        packageId: packageDetails.id,
        packageName: packageDetails.name,
        amountNgn: packageDetails.priceNgn,
        orderId: order.id
      }
    });

    return {
      authorizationUrl: paystackRes.authorizationUrl,
      reference,
      accessCode: paystackRes.accessCode,
      orderId: order.id,
      amountNgn: packageDetails.priceNgn,
      amountKobo: packageDetails.priceKobo,
      currency: 'NGN',
      packageId: packageDetails.id,
      packageName: packageDetails.name,
      package: packageDetails
    };
  }

  /**
   * Independently verify transaction directly with Paystack
   * Idempotent: safe against repeated requests.
   */
  async verifyPayment(reference, user = null, req = null) {
    if (!reference || typeof reference !== 'string') {
      throw ApiError.badRequest('Valid payment reference is required.');
    }

    // 1. Locate stored payment record
    const payRes = await db.query(
      `SELECT p.*, o.package_id, o.package_name, o.order_type, o.customer_name, o.customer_email
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE p.provider_reference = $1`,
      [reference]
    );
    const payment = payRes.rows[0];

    if (!payment) {
      throw ApiError.notFound(`Payment record not found for reference '${reference}'.`);
    }

    // Idempotency: return immediately if already verified
    if (payment.status === 'VERIFIED') {
      const order = await ordersRepo.findById(payment.order_id);
      return {
        reference: payment.provider_reference,
        status: order?.payment_status || 'PAID',
        amountNgn: parseFloat(payment.amount_ngn),
        currency: payment.currency || 'NGN',
        payment,
        order,
        package: getPackageById(payment.package_id || order?.package_id),
        message: 'Payment has already been verified and processed.',
        alreadyVerified: true
      };
    }

    // 2. Query Paystack server-side verification API
    const verifyResult = await paystackProvider.verifyTransaction(reference, payment);

    if (!verifyResult.success || verifyResult.status !== 'SUCCESSFUL') {
      throw ApiError.badRequest('Payment verification failed or transaction was not completed successfully.');
    }

    // Currency verification: must be NGN
    if (verifyResult.currency && verifyResult.currency !== 'NGN') {
      throw ApiError.badRequest(`Transaction currency mismatch. Expected NGN but received ${verifyResult.currency}.`);
    }

    // Amount verification: compare expected amount in NGN with received amount
    const expectedAmount = parseFloat(payment.amount_ngn);
    if (Math.abs(verifyResult.amountNgn - expectedAmount) > 0.01) {
      throw ApiError.badRequest(
        `Transaction amount mismatch. Expected ₦${expectedAmount} but received ₦${verifyResult.amountNgn}.`
      );
    }

    // 3. Atomically update payment, order, and fulfillment state
    const result = await db.transaction(async (client) => {
      // Mark payment VERIFIED
      const updatedPayRes = await client.query(
        `UPDATE payments
         SET status = 'VERIFIED',
             channel = $1,
             paid_at = $2,
             paystack_transaction_id = $3,
             paystack_metadata = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE provider_reference = $5
         RETURNING *`,
        [
          verifyResult.channel,
          verifyResult.paidAt,
          verifyResult.paystackTransactionId || null,
          JSON.stringify(verifyResult.metadata),
          reference
        ]
      );

      // If milestone tied to payment, mark milestone PAID
      if (payment.milestone_id) {
        await client.query(
          `UPDATE milestones SET status = 'PAID', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [payment.milestone_id]
        );
      }

      // Check total paid for order and update order status
      const totalPaidRes = await client.query(
        `SELECT SUM(amount_ngn) as total_paid FROM payments WHERE order_id = $1 AND status = 'VERIFIED'`,
        [payment.order_id]
      );
      const totalPaid = parseFloat(totalPaidRes.rows[0].total_paid || 0);

      const orderQueryRes = await client.query('SELECT total_amount_ngn FROM orders WHERE id = $1', [payment.order_id]);
      const orderTotal = parseFloat(orderQueryRes.rows[0].total_amount_ngn);

      const newOrderPaymentStatus = totalPaid >= orderTotal ? 'PAID' : 'PARTIAL';
      const updatedOrderRes = await client.query(
        `UPDATE orders
         SET payment_status = $1,
             status = 'ACTIVE',
             fulfillment_status = 'IN_PROGRESS',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newOrderPaymentStatus, payment.order_id]
      );

      return {
        payment: updatedPayRes.rows[0],
        order: updatedOrderRes.rows[0]
      };
    });

    await recordAuditLog({
      userId: user?.id || payment.user_id,
      action: 'PAYMENT_VERIFIED',
      entityType: 'PAYMENT',
      entityId: result.payment.id,
      req,
      details: {
        reference,
        amountNgn: result.payment.amount_ngn,
        orderId: result.order.id,
        packageId: result.order.package_id
      }
    });

    return {
      reference: result.payment.provider_reference,
      status: result.order.payment_status,
      amountNgn: parseFloat(result.payment.amount_ngn),
      currency: result.payment.currency || 'NGN',
      payment: result.payment,
      order: result.order,
      package: getPackageById(result.order.package_id),
      message: 'Payment successfully verified and confirmed.'
    };
  }

  /**
   * Handle incoming Paystack webhook with cryptographic signature verification and idempotency
   */
  async handleWebhook(rawBody, signature, req) {
    const isValid = paystackProvider.verifyWebhookSignature(signature, rawBody);
    if (!isValid) {
      throw ApiError.forbidden('Invalid Paystack webhook signature.');
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const eventId = event.event_id || (event.data?.id ? String(event.data.id) : null) || event.data?.reference;

    // Idempotency: Prevent duplicate processing if Paystack retries
    if (eventId) {
      const existing = await db.query('SELECT id FROM webhook_logs WHERE event_id = $1', [eventId]);
      if (existing.rows.length > 0) {
        logger.info(`[Paystack Webhook] Duplicate event ignored: ${eventId}`);
        return { received: true, message: 'Event already processed' };
      }
    }

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      if (reference) {
        try {
          await this.verifyPayment(reference, null, req);
          logger.info(`[Paystack Webhook] Successfully processed charge.success for ${reference}`);
        } catch (err) {
          logger.error(`[Paystack Webhook] Verification error on ${reference}:`, err.message);
        }
      }
    }

    // Persist webhook event for audit and idempotency
    try {
      await db.query(
        `INSERT INTO webhook_logs (event_id, event_type, reference, payload)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (event_id) DO NOTHING`,
        [
          eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          event.event || 'unknown',
          event.data?.reference || null,
          JSON.stringify(event)
        ]
      );
    } catch (logErr) {
      logger.warn('[Paystack Webhook] Failed to log webhook event:', logErr.message);
    }

    return { received: true };
  }

  async getMyPayments(userId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { payments, total } = await paymentsRepo.findByUser(userId, { limit, offset });
    return { payments, pagination: { page, limit, total } };
  }
}

module.exports = new PaymentsService();
