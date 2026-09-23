/**
 * MVPLaunch NG - Payments Validation Schemas
 */
const { z } = require('zod');

const initializePaymentSchema = z.object({
  orderId: z.string().uuid(),
  milestoneId: z.string().uuid().optional(),
  amountNgn: z.number().positive('Payment amount must be greater than 0 NGN'),
  callbackUrl: z.string().url().optional()
});

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required')
});

module.exports = {
  initializePaymentSchema,
  verifyPaymentSchema
};
