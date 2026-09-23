/**
 * MVPLaunch NG - Ideas Validation Schemas
 */
const { z } = require('zod');
const { IDEA_STATUS } = require('../../config/constants');

const createIdeaSchema = z.object({
  title: z.string().min(3, 'Idea title must be at least 3 characters').max(200),
  rawSummary: z.string().min(20, 'Please describe your idea in at least 20 characters'),
  targetIndustry: z.string().max(100).optional(),
  budgetBracket: z.string().max(100).optional(),
  targetTimeline: z.string().max(100).optional()
});

const updateIdeaStatusSchema = z.object({
  status: z.nativeEnum(IDEA_STATUS),
  adminNotes: z.string().optional()
});

module.exports = {
  createIdeaSchema,
  updateIdeaStatusSchema
};
