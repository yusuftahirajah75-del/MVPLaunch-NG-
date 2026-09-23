/**
 * MVPLaunch NG - JWT & Cookie Utility
 * Supports both HTTP-only secure cookies and Authorization Bearer headers.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign JWT token
 * @param {object} payload 
 * @param {string} expiresIn 
 * @returns {string}
 */
function signToken(payload, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token 
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/**
 * Set secure HTTP-only cookie
 * @param {import('express').Response} res 
 * @param {string} token 
 */
function setAuthCookie(res, token) {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/'
  };

  res.cookie(env.JWT_COOKIE_NAME, token, cookieOptions);
}

/**
 * Clear authentication cookie
 * @param {import('express').Response} res 
 */
function clearAuthCookie(res) {
  res.clearCookie(env.JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/'
  });
}

/**
 * Extract token from either HTTP-only cookie or Authorization: Bearer header
 * @param {import('express').Request} req 
 * @returns {string|null}
 */
function extractToken(req) {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies[env.JWT_COOKIE_NAME]) {
    return req.cookies[env.JWT_COOKIE_NAME];
  }
  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

module.exports = {
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  extractToken
};
