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

const updateRoleSchema = z.object({
  role: z.enum(['CLIENT', 'DEVELOPER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be either CLIENT, DEVELOPER, or ADMIN' })
  })
});

const createDeveloperSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
    .regex(/[0-9]/, 'Password must contain at least one number (0-9)'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
  specializations: z.array(z.string()).optional(),
  bio: z.string().nullable().optional()
});

module.exports = {
  updateProfileSchema,
  toggleStatusSchema,
  updateRoleSchema,
  createDeveloperSchema
};
