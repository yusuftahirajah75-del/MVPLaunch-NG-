/**
 * MVPLaunch NG - Handover Validation Schemas
 */
const { z } = require('zod');
const { HANDOVER_STATUS } = require('../../config/constants');

const initiateHandoverSchema = z.object({
  projectId: z.string().uuid(),
  githubRepo: z.string().url('Please enter a valid GitHub repository URL'),
  documentationUrl: z.string().url().optional(),
  notes: z.string().optional()
});

const updateHandoverStatusSchema = z.object({
  accessTransferred: z.boolean().optional(),
  credentialsTransferred: z.boolean().optional(),
  documentationUrl: z.string().url().optional(),
  notes: z.string().optional()
});

const signoffHandoverSchema = z.object({
  roleType: z.enum(['DEVELOPER', 'CLIENT'])
});

module.exports = {
  initiateHandoverSchema,
  updateHandoverStatusSchema,
  signoffHandoverSchema
};
