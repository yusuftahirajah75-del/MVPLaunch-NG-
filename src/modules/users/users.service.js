/**
 * MVPLaunch NG - Users Service
 */
const usersRepo = require('./users.repository');
const ApiError = require('../../utils/apiError');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

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
}

module.exports = new UsersService();
