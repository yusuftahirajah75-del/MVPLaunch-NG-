/**
 * MVPLaunch NG - Rate Limiting Middleware
 * Protects against brute-force and DDoS attacks.
 */
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many requests from this IP. Please try again after 15 minutes.',
      429
    );
  }
});

// Strict rate limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true',
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
      429
    );
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
