/**
 * MVPLaunch NG - Projects Validation Schemas
 */
const { z } = require('zod');
const { PROJECT_STATUS } = require('../../config/constants');

const createProjectSchema = z.object({
  ideaId: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  targetDeliveryDate: z.string().optional()
});

const updateProjectStatusSchema = z.object({
  status: z.nativeEnum(PROJECT_STATUS),
  repoUrl: z.string().url().optional(),
  stagingUrl: z.string().url().optional(),
  productionUrl: z.string().url().optional()
});

const assignDeveloperSchema = z.object({
  developerId: z.string().uuid()
});

module.exports = {
  createProjectSchema,
  updateProjectStatusSchema,
  assignDeveloperSchema
};
