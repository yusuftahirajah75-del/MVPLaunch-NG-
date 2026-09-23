/**
 * MVPLaunch NG - Audit Logging Utility & Middleware
 */
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Persist an audit log record
 * @param {object} param0 
 */
async function recordAuditLog({
  userId = null,
  action,
  entityType,
  entityId = null,
  req = null,
  details = {}
}) {
  try {
    const ip = req ? req.ip || req.connection?.remoteAddress : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, entityType, entityId ? String(entityId) : null, ip, userAgent, JSON.stringify(details)]
    );
  } catch (error) {
    logger.error('Failed to write audit log to database:', error);
  }
}

/**
 * Express middleware helper to automatically log state transitions upon successful responses
 */
function auditAction(action, entityType, getEntityIdFn = null) {
  return (req, res, next) => {
    const originalSend = res.json.bind(res);

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = getEntityIdFn
          ? getEntityIdFn(req, body)
          : req.params.id || body?.data?.id || null;

        recordAuditLog({
          userId: req.user?.id || null,
          action,
          entityType,
          entityId,
          req,
          details: {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode
          }
        });
      }
      return originalSend(body);
    };

    next();
  };
}

module.exports = {
  recordAuditLog,
  auditAction
};
