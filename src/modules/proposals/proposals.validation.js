/**
 * MVPLaunch NG - Proposals Validation Schemas
 */
const { z } = require('zod');

const createProposalSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(5).max(200),
  priceNgn: z.number().positive('Price must be greater than 0 NGN'),
  durationDays: z.number().int().positive('Duration must be at least 1 day'),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable required'),
  terms: z.string().optional(),
  validUntilDays: z.number().int().default(14)
});

const respondProposalSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE'])
});

module.exports = {
  createProposalSchema,
  respondProposalSchema
};
