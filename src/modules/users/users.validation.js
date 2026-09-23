/**
 * MVPLaunch NG - Users Validation Schemas
 */
const { z } = require('zod');

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional()
});

const toggleStatusSchema = z.object({
  isActive: z.boolean()
});

module.exports = {
  updateProfileSchema,
  toggleStatusSchema
};
