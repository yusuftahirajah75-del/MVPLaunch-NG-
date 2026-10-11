/**
 * MVPLaunch NG - Server Entry Point
 * Fast port binding: Express listens immediately so Render detects port readiness
 * within milliseconds, preventing prolonged cold-start holding screens.
 */
const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');
const { ensureDemoUsers } = require('./modules/auth/demoSeed.service');

// 1. Bind to port IMMEDIATELY so Render marks instance as HEALTHY instantly (<50ms)
const server = app.listen(env.PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 ${env.APP_NAME} Backend API is running!`);
  logger.info(`🌐 URL: http://localhost:${env.PORT}`);
  logger.info(`📖 Swagger Docs: http://localhost:${env.PORT}/api-docs`);
  logger.info(`⚡ Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`=======================================================`);
});

// 2. Perform database connection check and deferred maintenance in background without blocking port binding
setImmediate(async () => {
  try {
    const dbHealth = await db.testConnection();
    if (dbHealth.success) {
      logger.info(`Connected to PostgreSQL database at ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
      // Only seed or verify demo accounts in development/test, NEVER on production cold starts
      if (env.NODE_ENV !== 'production' && process.env.RENDER !== 'true') {
        try {
          await ensureDemoUsers();
        } catch (seedErr) {
          logger.warn(`Notice: Demo accounts verification deferred: ${seedErr.message}`);
        }
      }
    } else {
      logger.warn(`PostgreSQL connection notice: ${dbHealth.error}`);
    }
  } catch (err) {
    logger.warn(`Database background init notice: ${err.message}`);
  }
});

// 3. Automated Keep-Alive Ping (Runs in production to prevent Render free-tier cold-start sleep)
if (env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
  const pingTarget = `${env.APP_URL}/api/v1/health`;
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (Render spins down after 15m)

  setInterval(() => {
    try {
      const client = pingTarget.startsWith('https') ? require('https') : require('http');
      client.get(pingTarget, (res) => {
        logger.info(`[KeepAlive] Automated ping sent to ${pingTarget} (Status: ${res.statusCode})`);
      }).on('error', (err) => {
        logger.warn(`[KeepAlive] Ping warning: ${err.message}`);
      });
    } catch (e) {
      // Ignore
    }
  }, PING_INTERVAL_MS);

  logger.info(`[KeepAlive] Service scheduled to self-ping every 10m to prevent Render cold-start spindown.`);
}

// 4. Graceful Shutdown
const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await db.pool.end();
      logger.info('PostgreSQL connection pool closed.');
    } catch (err) {
      logger.error('Error during pool termination:', err);
    }
    process.exit(0);
  });

  // Force shutdown if stuck
  setTimeout(() => {
    logger.error('Forced shutdown: could not close all connections in time.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
