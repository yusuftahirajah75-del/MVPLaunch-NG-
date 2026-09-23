/**
 * MVPLaunch NG - Payments Service
 */
const paymentsRepo = require('./payments.repository');
const ordersRepo = require('../orders/orders.repository');
const milestonesRepo = require('../milestones/milestones.repository');
const paystackProvider = require('../../providers/payment/paystack.provider');
const db = require('../../config/db');
const ApiError = require('../../utils/apiError');
const env = require('../../config/env');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class PaymentsService {
  async initializePayment(user, { orderId, milestoneId, amountNgn, callbackUrl }, req) {
    const order = await ordersRepo.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    if (order.client_id !== user.id) {
      throw ApiError.forbidden('You can only make payments for your own orders.');
    }

    const reference = `mvp_pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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

  async verifyPayment(reference, user, req) {
    const payment = await paymentsRepo.findByReference(reference);
    if (!payment) {
      throw ApiError.notFound('Payment record not found.');
    }

    if (payment.status === 'VERIFIED') {
      return { payment, message: 'Payment has already been verified and processed.' };
    }

    const verifyResult = await paystackProvider.verifyTransaction(reference);

    if (!verifyResult.success) {
      throw ApiError.badRequest('Payment verification failed or transaction was not successful.');
    }

    // Process transaction atomically in PostgreSQL
    const updatedPayment = await db.transaction(async (client) => {
      // 1. Mark payment verified
      const payRes = await client.query(
        `UPDATE payments
         SET status = 'VERIFIED',
             channel = $1,
             paid_at = $2,
             paystack_metadata = $3
         WHERE provider_reference = $4
         RETURNING *`,
        [verifyResult.channel, verifyResult.paidAt, JSON.stringify(verifyResult.metadata), reference]
      );

      // 2. If milestone tied to payment, mark milestone PAID
      if (payment.milestone_id) {
        await client.query(
          `UPDATE milestones SET status = 'PAID' WHERE id = $1`,
          [payment.milestone_id]
        );
      }

      // 3. Check total paid for order and update order status
      const totalPaidRes = await client.query(
        `SELECT SUM(amount_ngn) as total_paid FROM payments WHERE order_id = $1 AND status = 'VERIFIED'`,
        [payment.order_id]
      );
      const totalPaid = parseFloat(totalPaidRes.rows[0].total_paid || 0);

      const orderRes = await client.query('SELECT total_amount_ngn FROM orders WHERE id = $1', [payment.order_id]);
      const orderTotal = parseFloat(orderRes.rows[0].total_amount_ngn);

      const newOrderPaymentStatus = totalPaid >= orderTotal ? 'PAID' : 'PARTIAL';
      await client.query(
        `UPDATE orders SET payment_status = $1, status = 'ACTIVE' WHERE id = $2`,
        [newOrderPaymentStatus, payment.order_id]
      );

      return payRes.rows[0];
    });

    await recordAuditLog({
      userId: user?.id || payment.user_id,
      action: 'PAYMENT_VERIFIED',
      entityType: 'PAYMENT',
      entityId: updatedPayment.id,
      req,
      details: { reference, amountNgn: updatedPayment.amount_ngn }
    });

    return {
      payment: updatedPayment,
      message: 'Payment successfully verified and credited.'
    };
  }

  async handleWebhook(rawBody, signature, req) {
    const isValid = paystackProvider.verifyWebhookSignature(signature, rawBody);
    if (!isValid) {
      throw ApiError.forbidden('Invalid Paystack webhook signature.');
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      try {
        await this.verifyPayment(reference, null, req);
      } catch (err) {
        console.error('[Paystack Webhook] Verification error:', err.message);
      }
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
