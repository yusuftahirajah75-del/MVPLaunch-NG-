/**
 * MVPLaunch NG - Role-Based Access Control (RBAC) Middleware
 */
const ApiError = require('../utils/apiError');

/**
 * Restrict endpoint to specified roles
 * @param  {...string} allowedRoles 
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: requires role [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

module.exports = {
  authorize
};
