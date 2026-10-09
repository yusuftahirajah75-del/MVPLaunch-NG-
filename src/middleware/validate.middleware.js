/**
 * MVPLaunch NG - Zod Request Validation Middleware
 */
const { ZodError } = require('zod');
const ApiError = require('../utils/apiError');

/**
 * Validates request payload against Zod schema
 * @param {object} schemaObj Object containing body, query, and/or params Zod schemas
 */
function validate(schemaObj) {
  return async (req, res, next) => {
    try {
      if (schemaObj.body) {
        req.body = await schemaObj.body.parseAsync(req.body);
      }
      if (schemaObj.query) {
        req.query = await schemaObj.query.parseAsync(req.query);
      }
      if (schemaObj.params) {
        req.params = await schemaObj.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        const summaryMessage = errors.length > 0
          ? `Validation error: ${errors.map((e) => e.message).join('. ')}`
          : 'Validation error: invalid request payload';
        return next(new ApiError(422, summaryMessage, errors));
      }
      next(error);
    }
  };
}

module.exports = {
  validate
};
