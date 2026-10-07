/**
 * MVPLaunch NG - Projects Validation Schemas
 * Comprehensive validation for end-to-end client service platform workflow
 */
const { z } = require('zod');
const { PROJECT_STATUS } = require('../../config/constants');

const createProjectSchema = z.object({
  ideaId: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  targetDeliveryDate: z.string().optional()
});

const submitProjectSchema = z.object({
  orderId: z.string().uuid().optional(),
  paymentReference: z.string().optional(),
  title: z.string().min(3, 'Project title must be at least 3 characters').max(200),
  organizationName: z.string().max(200).optional().nullable(),
  industry: z.string().min(2, 'Industry is required'),
  problemStatement: z.string().min(10, 'Please describe the problem you are solving (min 10 characters)'),
  targetUsers: z.string().min(3, 'Target users are required'),
  proposedSolution: z.string().min(10, 'Proposed solution description is required (min 10 characters)'),
  coreFeatures: z.union([z.array(z.string()), z.string()]).optional(),
  niceToHaveFeatures: z.union([z.array(z.string()), z.string()]).optional(),
  expectedOutcome: z.string().optional().nullable(),
  existingProductUrl: z.string().url().optional().nullable().or(z.literal('')),
  competitorReferences: z.string().optional().nullable(),
  designPreferences: z.string().optional().nullable(),
  technicalRequirements: z.string().optional().nullable(),
  preferredDeadline: z.string().optional().nullable(),
  selectedPackageId: z.string().optional().nullable(),
  selectedPackageName: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable()
});

const updateProjectStatusSchema = z.object({
  status: z.nativeEnum(PROJECT_STATUS),
  repoUrl: z.string().url().optional().nullable().or(z.literal('')),
  stagingUrl: z.string().url().optional().nullable().or(z.literal('')),
  productionUrl: z.string().url().optional().nullable().or(z.literal(''))
});

const updateScopeSchema = z.object({
  adminNotes: z.string().optional().nullable(),
  adminInstructions: z.string().optional().nullable(),
  acceptanceCriteria: z.string().optional().nullable(),
  internalDeadline: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  status: z.nativeEnum(PROJECT_STATUS).optional()
});

const assignEngineerSchema = z.object({
  developerId: z.string().uuid().nullable().optional(),
  instructions: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  internalDeadline: z.string().optional().nullable()
});

const updateProgressSchema = z.object({
  progressPercent: z.number().min(0).max(100).optional(),
  completedFeatures: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  knownLimitations: z.string().optional().nullable(),
  deliverableNotes: z.string().optional().nullable(),
  status: z.nativeEnum(PROJECT_STATUS).optional()
});

const submitDeliverableSchema = z.object({
  title: z.string().min(2, 'Deliverable title is required'),
  stagingUrl: z.string().url().optional().nullable().or(z.literal('')),
  repoUrl: z.string().url().optional().nullable().or(z.literal('')),
  productionUrl: z.string().url().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable()
});

const reviewDeliverableSchema = z.object({
  status: z.enum(['APPROVED', 'REVISION_REQUIRED']),
  adminFeedback: z.string().optional().nullable(),
  projectStatus: z.nativeEnum(PROJECT_STATUS).optional()
});

const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
  noteType: z.enum(['INTERNAL', 'CLIENT_VISIBLE', 'STATUS_UPDATE']).optional().default('INTERNAL'),
  isInternal: z.boolean().optional().default(true)
});

module.exports = {
  createProjectSchema,
  submitProjectSchema,
  updateProjectStatusSchema,
  updateScopeSchema,
  assignEngineerSchema,
  updateProgressSchema,
  submitDeliverableSchema,
  reviewDeliverableSchema,
  addNoteSchema
};
