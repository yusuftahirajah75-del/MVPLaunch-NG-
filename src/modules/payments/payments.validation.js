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

const initializePackagePaymentSchema = z.object({
  packageId: z.string().transform((v) => (v ? v.toLowerCase().replace(/_/g, '-') : v)).pipe(
    z.enum([
      'idea-validation',
      'student-project',
      'founder-mvp',
      'business-digital',
      // Backward compatibility aliases
      'student-starter',
      'mvp-starter',
      'business-launch'
    ], {
      errorMap: () => ({ message: 'Invalid package identifier. Must be idea-validation, student-project, founder-mvp, or business-digital' })
    })
  ),
  customerName: z.string().min(2, 'Customer full name must be at least 2 characters').max(150),
  customerEmail: z.string().email('Valid email address is required for receipt and communication'),
  customerPhone: z.string().max(30).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  callbackUrl: z.string().url().optional().nullable()
});

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required')
});

module.exports = {
  initializePaymentSchema,
  initializePackagePaymentSchema,
  verifyPaymentSchema
};
