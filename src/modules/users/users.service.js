const usersRepo = require('./users.repository');
const ApiError = require('../../utils/apiError');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');
const { hashPassword } = require('../../utils/password');
const { ROLES } = require('../../config/constants');

class UsersService {
  async listUsers(filters) {
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { users, total } = await usersRepo.findAll({
      role: filters.role,
      search: filters.search,
      limit,
      offset
    });

    return { users, pagination: { page, limit, total } };
  }

  async getUserById(id) {
    const user = await usersRepo.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return user;
  }

  async updateProfile(userId, updateData, req) {
    const updated = await usersRepo.updateProfile(userId, updateData);
    await recordAuditLog({
      userId,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'USER',
      entityId: userId,
      req,
      details: updateData
    });
    return updated;
  }

  async setUserStatus(targetUserId, isActive, adminUserId, req) {
    const user = await usersRepo.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const updated = await usersRepo.setStatus(targetUserId, isActive);
    await recordAuditLog({
      userId: adminUserId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'USER',
      entityId: targetUserId,
      req
    });
    return updated;
  }

  async setUserRole(targetUserId, newRole, adminUserId, req) {
    const user = await usersRepo.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    // Safety guard: prevent removing the last admin or demoting self accidentally
    if (user.id === adminUserId && newRole !== ROLES.ADMIN) {
      throw ApiError.badRequest('Administrators cannot demote their own account.');
    }

    const updated = await usersRepo.setRole(targetUserId, newRole);
    await recordAuditLog({
      userId: adminUserId,
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: targetUserId,
      req,
      details: { oldRole: user.role, newRole }
    });
    return updated;
  }

  async createDeveloper(data, adminUserId, req) {
    const existing = await usersRepo.findAll({ search: data.email, limit: 1 });
    if (existing.users.length > 0 && existing.users[0].email.toLowerCase() === data.email.toLowerCase()) {
      throw ApiError.conflict('A user with this email address already exists.');
    }

    const passwordHash = await hashPassword(data.password);
    const developer = await usersRepo.createDeveloper({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber || null,
      skills: data.skills || null,
      specializations: data.specializations || [],
      bio: data.bio || null
    });

    await recordAuditLog({
      userId: adminUserId,
      action: 'DEVELOPER_ACCOUNT_CREATED',
      entityType: 'USER',
      entityId: developer.id,
      req,
      details: { email: developer.email, role: 'DEVELOPER' }
    });

    return developer;
  }
}

module.exports = new UsersService();
