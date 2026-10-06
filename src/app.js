/**
 * MVPLaunch NG - Express Application Setup
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const env = require('./config/env');
const apiRouter = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();

// 1. Security HTTP Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI & local development
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        env.CORS_ORIGIN.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.includes('mvplaunch-ng') ||
        env.NODE_ENV === 'development'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-paystack-signature']
  })
);

// 3. Body Parsing & Cookies (capturing rawBody for Paystack webhook HMAC verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Static Uploads directory
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// 5. Swagger/OpenAPI Documentation
try {
  const swaggerDocument = YAML.load(path.resolve(__dirname, '../openapi.yaml'));
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'MVPLaunch NG - API Documentation',
      customCss: '.swagger-ui .topbar { display: none }'
    })
  );
} catch (err) {
  console.warn('[Swagger] Warning: could not load openapi.yaml:', err.message);
}

const fs = require('fs');

// 6. Root route
app.get('/', (req, res, next) => {
  const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
  if (fs.existsSync(frontendDistPath) && env.NODE_ENV !== 'test' && !req.xhr && req.accepts('html')) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
  res.json({
    name: env.APP_NAME,
    tagline: 'Turn your validated idea into something real you can show people.',
    version: '1.0.0',
    documentation: '/api-docs',
    apiPrefix: env.API_PREFIX
  });
});

// 7. Rate Limiter on API routes
app.use(env.API_PREFIX, apiLimiter);

// 8. Mount Master API Router
app.use(env.API_PREFIX, apiRouter);

// 9. Static Frontend SPA fallback (Production / Render single service)
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath) && env.NODE_ENV !== 'test') {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith(env.API_PREFIX) ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/api-docs')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 9. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
