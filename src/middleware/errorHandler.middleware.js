/**
 * MVPLaunch NG - Centralized Error Handling Middleware
 */
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * 404 Route Not Found handler
 */
function notFoundHandler(req, res, next) {
  return next(ApiError.notFound(`Endpoint '${req.originalUrl}' does not exist on this server.`));
}

/**
 * Central Error Handler
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.details || null;

  // Handle PostgreSQL known database constraint errors
  if (err.code === '23505') {
    // Unique violation
    statusCode = 409;
    message = 'A record with this information already exists.';
    errors = { detail: err.detail };
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Referenced related record does not exist or cannot be modified.';
    errors = { detail: err.detail };
  } else if (err.code === '22P02') {
    // Invalid UUID / type syntax
    statusCode = 400;
    message = 'Invalid format for UUID or numeric parameter.';
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  } else if (
    ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', '57P01', '57P02', '57P03'].includes(err.code) ||
    err.message?.includes('connect ECONNREFUSED')
  ) {
    statusCode = 503;
    message = 'Database service is temporarily unavailable. Please verify connectivity and try again.';
  }

  if (statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.debug(`[${statusCode} Client Error] ${req.method} ${req.originalUrl}: ${message}`);
  }

  // Include stack trace only in development
  const responsePayload = {
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
  };

  return res.status(statusCode).json(responsePayload);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
