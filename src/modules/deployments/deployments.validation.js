/**
 * MVPLaunch NG - Deployments Validation Schemas
 */
const { z } = require('zod');
const { DEPLOYMENT_ENV } = require('../../config/constants');

const createDeploymentSchema = z.object({
  projectId: z.string().uuid(),
  environment: z.nativeEnum(DEPLOYMENT_ENV),
  deploymentUrl: z.string().url('Please enter a valid URL'),
  commitHash: z.string().optional(),
  status: z.enum(['PENDING', 'LIVE', 'FAILED']).default('LIVE'),
  notes: z.string().optional()
});

module.exports = {
  createDeploymentSchema
};
