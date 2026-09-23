/**
 * MVPLaunch NG - Custom API Error Class
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode 
   * @param {string} message 
   * @param {any} details 
   * @param {boolean} isOperational 
   */
  constructor(statusCode, message, details = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized access', details = null) {
    return new ApiError(401, message, details);
  }

  static forbidden(message = 'Access forbidden', details = null) {
    return new ApiError(403, message, details);
  }

  static notFound(message = 'Resource not found', details = null) {
    return new ApiError(404, message, details);
  }

  static conflict(message = 'Resource conflict', details = null) {
    return new ApiError(409, message, details);
  }

  static unprocessable(message = 'Validation failed', details = null) {
    return new ApiError(422, message, details);
  }

  static internal(message = 'Internal server error', details = null) {
    return new ApiError(500, message, details, false);
  }
}

module.exports = ApiError;
