/**
 * MVPLaunch NG - Milestones Validation Schemas
 */
const { z } = require('zod');
const { MILESTONE_STATUS } = require('../../config/constants');

const createMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  orderIndex: z.number().int().positive().default(1),
  amountNgn: z.number().nonnegative().default(0),
  dueDate: z.string().optional()
});

const updateMilestoneSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(MILESTONE_STATUS).optional(),
  dueDate: z.string().optional()
});

module.exports = {
  createMilestoneSchema,
  updateMilestoneSchema
};
