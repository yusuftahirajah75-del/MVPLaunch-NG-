/**
 * MVPLaunch NG - Tasks Validation Schemas
 */
const { z } = require('zod');
const { TASK_STATUS, TASK_PRIORITY } = require('../../config/constants');

const createTaskSchema = z.object({
  milestoneId: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  priority: z.nativeEnum(TASK_PRIORITY).default(TASK_PRIORITY.MEDIUM),
  assignedTo: z.string().uuid().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TASK_STATUS).optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  assignedTo: z.string().uuid().nullable().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
