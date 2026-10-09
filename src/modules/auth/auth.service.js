/**
 * MVPLaunch NG - Auth Service
 */
const authRepo = require('./auth.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/token');
const ApiError = require('../../utils/apiError');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

function formatUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name || user.fullName,
    full_name: user.full_name || user.fullName,
    phoneNumber: user.phone_number || user.phoneNumber || null,
    phone_number: user.phone_number || user.phoneNumber || null,
    role: user.role,
    avatarUrl: user.avatar_url || user.avatarUrl || null,
    bio: user.bio || null,
    isActive: user.is_active ?? user.isActive ?? true,
    is_active: user.is_active ?? user.isActive ?? true,
    isVerified: user.is_verified ?? user.isVerified ?? false,
    is_verified: user.is_verified ?? user.isVerified ?? false,
    createdAt: user.created_at || user.createdAt,
    created_at: user.created_at || user.createdAt
  };
}

class AuthService {
  async register({ email, password, fullName, phoneNumber, role }, req) {
    const existing = await authRepo.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists. Please sign in instead.');
    }

    const passwordHash = await hashPassword(password);
    const user = await authRepo.createUser({
      email,
      passwordHash,
      fullName,
      phoneNumber: phoneNumber || null,
      role: role || 'CLIENT'
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    await recordAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      req,
      details: { email: user.email, role: user.role }
    });

    return { user: formatUser(user), token };
  }

  async login({ email, password }, req) {
    const user = await authRepo.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password credentials.');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password credentials.');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    await recordAuditLog({
      userId: user.id,
      action: 'USER_LOGGED_IN',
      entityType: 'USER',
      entityId: user.id,
      req
    });

    return { user: formatUser(user), token };
  }

  async changePassword(userId, { currentPassword, newPassword }, req) {
    const user = await authRepo.findByEmail((await authRepo.findById(userId)).email);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest('Current password provided is incorrect.');
    }

    const newHash = await hashPassword(newPassword);
    await authRepo.updatePassword(userId, newHash);

    await recordAuditLog({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: userId,
      req
    });

    return { message: 'Password updated successfully.' };
  }

  async getCurrentUser(userId) {
    const user = await authRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return formatUser(user);
  }
}

module.exports = new AuthService();
