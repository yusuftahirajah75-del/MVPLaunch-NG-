/**
 * MVPLaunch NG - Reviews Validation Schemas
 */
const { z } = require('zod');

const createReviewSchema = z.object({
  projectId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  feedbackText: z.string().min(10, 'Review feedback must be at least 10 characters')
});

const featureReviewSchema = z.object({
  isFeatured: z.boolean()
});

module.exports = {
  createReviewSchema,
  featureReviewSchema
};
