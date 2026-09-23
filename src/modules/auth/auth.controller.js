/**
 * MVPLaunch NG - Auth Controller
 */
const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');
const { setAuthCookie, clearAuthCookie } = require('../../utils/token');

class AuthController {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body, req);
      setAuthCookie(res, token);
      return ApiResponse.created(res, 'Account created successfully', { user, token });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body, req);
      setAuthCookie(res, token);
      return ApiResponse.success(res, 'Login successful', { user, token });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      clearAuthCookie(res);
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return ApiResponse.success(res, 'Current user profile retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword(req.user.id, req.body, req);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
