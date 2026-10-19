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

// 4. Static Uploads directory (with strict MIME sniffing & sandbox protective headers)
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), {
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      if (filePath.endsWith('.svg') || filePath.endsWith('.html') || filePath.endsWith('.htm')) {
        res.setHeader('Content-Disposition', 'attachment');
        res.setHeader('Content-Type', 'application/octet-stream');
      }
    }
  })
);

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

// Cache dist directory status once at startup instead of blocking fs calls on every request
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const hasFrontend = fs.existsSync(frontendDistPath) && env.NODE_ENV !== 'test';

// 6. Fast Static Assets & Caching (mounted early with 1-year immutable cache for hashed bundles)
if (hasFrontend) {
  app.use(
    express.static(frontendDistPath, {
      maxAge: '1y',
      immutable: true,
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
      }
    })
  );
}

// 7. Instant Health Check (Root /health for ping monitors & Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: env.APP_NAME, uptime: `${Math.floor(process.uptime())}s` });
});

// 8. Root route - Serve Landing Page immediately without redirects or delays
app.get('/', (req, res, next) => {
  if (hasFrontend && !req.xhr && req.accepts('html')) {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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

// 9. Rate Limiter on API routes
app.use(env.API_PREFIX, apiLimiter);

// 10. Mount Master API Router
app.use(env.API_PREFIX, apiRouter);

// 11. Static Frontend SPA fallback for client-side routing
if (hasFrontend) {
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith(env.API_PREFIX) ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/api-docs')
    ) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 9. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
