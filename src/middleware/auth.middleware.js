/**
 * MVPLaunch NG - Authentication Middleware
 */
const { extractToken, verifyToken } = require('../utils/token');
const ApiError = require('../utils/apiError');
const db = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(ApiError.unauthorized('Authentication required. Please log in.'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(ApiError.unauthorized('Invalid or expired authentication token.'));
    }

    // Verify user exists and is active in database
    const userQuery = await db.query(
      'SELECT id, email, full_name, phone_number, role, is_active, is_verified, avatar_url FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userQuery.rows.length === 0) {
      return next(ApiError.unauthorized('User account no longer exists.'));
    }

    const user = userQuery.rows[0];
    if (!user.is_active) {
      return next(ApiError.forbidden('User account is currently suspended.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication: attaches user if token present, but doesn't block unauthenticated requests
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      const userQuery = await db.query(
        'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );
      if (userQuery.rows.length > 0 && userQuery.rows[0].is_active) {
        req.user = userQuery.rows[0];
      }
    }
    next();
  } catch (err) {
    // Silently continue without user
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuth
};
