/**
 * MVPLaunch NG - Validation & User Testing Validation Schemas
 */
const { z } = require('zod');

const createValidationReportSchema = z.object({
  projectId: z.string().uuid(),
  testingPhase: z.string().min(2).max(50),
  totalTesters: z.number().int().nonnegative().default(0),
  keyFindings: z.string().min(10, 'Key findings must be at least 10 characters'),
  userFeedback: z.array(z.any()).default([]),
  netPromoterScore: z.number().int().min(0).max(10).optional()
});

module.exports = {
  createValidationReportSchema
};
