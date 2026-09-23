/**
 * MVPLaunch NG - Users Controller
 */
const usersService = require('./users.service');
const ApiResponse = require('../../utils/apiResponse');

class UsersController {
  async listUsers(req, res, next) {
    try {
      const { users, pagination } = await usersService.listUsers(req.query);
      return ApiResponse.paginated(res, 'Users retrieved successfully', users, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await usersService.getUserById(req.params.id);
      return ApiResponse.success(res, 'User details retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await usersService.updateProfile(req.user.id, req.body, req);
      return ApiResponse.success(res, 'Profile updated successfully', { user: updated });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const updated = await usersService.setUserStatus(req.params.id, req.body.isActive, req.user.id, req);
      return ApiResponse.success(res, `User account ${req.body.isActive ? 'activated' : 'deactivated'} successfully`, { user: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
