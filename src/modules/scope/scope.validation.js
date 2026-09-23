/**
 * MVPLaunch NG - Scope, Problem & Customer Validation Schemas
 */
const { z } = require('zod');

const problemClarificationSchema = z.object({
  ideaId: z.string().uuid(),
  coreProblem: z.string().min(10, 'Core problem definition must be at least 10 characters'),
  alternativeSolutions: z.string().optional(),
  uniqueValueProp: z.string().min(10, 'Value proposition must be at least 10 characters'),
  whyNow: z.string().optional(),
  monetizationHypothesis: z.string().optional()
});

const customerDefinitionSchema = z.object({
  ideaId: z.string().uuid(),
  primaryPersona: z.string().min(3),
  painPoints: z.string().min(10),
  distributionChannel: z.string().optional(),
  userArchetype: z.string().optional(),
  locationContext: z.string().default('Nigeria')
});

const mvpScopeSchema = z.object({
  ideaId: z.string().uuid(),
  mustHaveFeatures: z.array(z.string()).min(1, 'At least one core feature is required'),
  outOfScopeFeatures: z.array(z.string()).default([]),
  techStackPreferences: z.array(z.string()).default(['React', 'Node.js', 'PostgreSQL']),
  targetLaunchDate: z.string().optional(),
  complexityRating: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  estimatedWeeks: z.number().int().min(1).max(12).default(3)
});

module.exports = {
  problemClarificationSchema,
  customerDefinitionSchema,
  mvpScopeSchema
};
