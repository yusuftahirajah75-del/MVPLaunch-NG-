/**
 * MVPLaunch NG - Server Entry Point
 */
const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');
const { ensureDemoUsers } = require('./modules/auth/demoSeed.service');

async function startServer() {
  // Test PostgreSQL connection
  const dbHealth = await db.testConnection();
  if (dbHealth.success) {
    logger.info(`Connected to PostgreSQL database at ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
    try {
      await ensureDemoUsers();
    } catch (seedErr) {
      logger.warn(`Notice: Demo accounts verification deferred: ${seedErr.message}`);
    }
  } else {
    logger.warn(`PostgreSQL connection notice: ${dbHealth.error}`);
    logger.info('To connect to a live database, ensure PostgreSQL is running or set DATABASE_URL in .env');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`=======================================================`);
    logger.info(`🚀 ${env.APP_NAME} Backend API is running!`);
    logger.info(`🌐 URL: http://localhost:${env.PORT}`);
    logger.info(`📖 Swagger Docs: http://localhost:${env.PORT}/api-docs`);
    logger.info(`⚡ Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    logger.info(`=======================================================`);
  });

  // Graceful Shutdown
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
}

startServer().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
