/**
 * MVPLaunch NG - Auth Validation Schemas
 */
const { z } = require('zod');

// Normalizes input payload: supports name/full_name -> fullName, phone/phone_number -> phoneNumber
const normalizeRegisterPayload = (data) => {
  if (data && typeof data === 'object') {
    const copy = { ...data };
    if (!copy.fullName && copy.name) {
      copy.fullName = copy.name;
    }
    if (!copy.fullName && copy.full_name) {
      copy.fullName = copy.full_name;
    }
    if (!copy.phoneNumber && copy.phone) {
      copy.phoneNumber = copy.phone;
    }
    if (!copy.phoneNumber && copy.phone_number) {
      copy.phoneNumber = copy.phone_number;
    }
    if (typeof copy.fullName === 'string') {
      copy.fullName = copy.fullName.trim();
    }
    if (typeof copy.email === 'string') {
      copy.email = copy.email.trim().toLowerCase();
    }
    if (typeof copy.phoneNumber === 'string') {
      copy.phoneNumber = copy.phoneNumber.trim();
      if (copy.phoneNumber.length === 0) copy.phoneNumber = null;
    }
    return copy;
  }
  return data;
};

// Normalizes roles: 'CLIENT / FOUNDER', 'Client / Founder', 'CLIENT' -> 'CLIENT'; 'MVP DEVELOPER', 'DEVELOPER' -> 'DEVELOPER'
const normalizeRole = (val) => {
  if (typeof val === 'string') {
    const upper = val.toUpperCase().trim();
    if (upper.includes('DEVELOPER')) return 'DEVELOPER';
    if (upper.includes('CLIENT') || upper.includes('FOUNDER')) return 'CLIENT';
  }
  return val;
};

const registerSchema = z.preprocess(
  normalizeRegisterPayload,
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
      .regex(/[0-9]/, 'Password must contain at least one number (0-9)'),
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
    role: z
      .preprocess(normalizeRole, z.enum(['CLIENT', 'DEVELOPER']).default('CLIENT'))
  })
);

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter (A-Z)')
    .regex(/[0-9]/, 'New password must contain at least one number (0-9)')
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
};

