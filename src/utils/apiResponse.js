/**
 * MVPLaunch NG - Standardized API Response Helper
 */
class ApiResponse {
  /**
   * Success response
   * @param {import('express').Response} res 
   * @param {string} message 
   * @param {any} data 
   * @param {number} statusCode 
   * @param {object} meta 
   */
  static success(res, message = 'Operation successful', data = null, statusCode = 200, meta = null) {
    const payload = {
      success: true,
      statusCode,
      message,
      data
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  /**
   * Created response (201)
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return this.success(res, message, data, 201);
  }

  /**
   * Paginated response
   */
  static paginated(res, message = 'Records retrieved', items = [], pagination = {}) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data: items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: pagination.total || items.length,
        totalPages: Math.ceil((pagination.total || items.length) / (pagination.limit || 20))
      }
    });
  }

  /**
   * Error response
   */
  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const payload = {
      success: false,
      statusCode,
      message
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
