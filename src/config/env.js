/**
 * MVPLaunch NG - Environment Configuration
 */
require('dotenv').config();

const isRender = process.env.RENDER === 'true' || Boolean(process.env.RENDER_EXTERNAL_URL) || Boolean(process.env.RENDER_SERVICE_ID);
const isProduction = process.env.NODE_ENV === 'production' || isRender;
const isLiveKey = (process.env.PAYSTACK_SECRET_KEY || '').trim().startsWith('sk_live_');

const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || (isRender ? 'production' : 'development'),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  APP_NAME: process.env.APP_NAME || 'MVPLaunch NG',
  APP_URL: isProduction
    ? (process.env.APP_URL && !process.env.APP_URL.includes('localhost') ? process.env.APP_URL : 'https://mvplaunch-ng.onrender.com')
    : (process.env.APP_URL || 'http://localhost:5000'),
  FRONTEND_URL: isProduction
    ? (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost') ? process.env.FRONTEND_URL : 'https://mvplaunch-ng.onrender.com')
    : (process.env.FRONTEND_URL || 'http://localhost:3000'),

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'mvplaunch_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_SSL: process.env.DB_SSL === 'true',
  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX || '20', 10),
  DB_POOL_IDLE_TIMEOUT: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  DB_POOL_CONN_TIMEOUT: parseInt(process.env.DB_POOL_CONN_TIMEOUT || '5000', 10),

  // Auth / JWT
  JWT_SECRET: process.env.JWT_SECRET || 'mvplaunch_fallback_development_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || 'mvplaunch_token',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || isProduction,
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),

  // Rate Limiter
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://mvplaunch-ng.onrender.com',
        'http://localhost:5000',
        'http://localhost:5005'
      ],

  // Payment Provider & Paystack
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'paystack',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || '',
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  // Strict Mock Mode Isolation:
  // Disabled unconditionally if running in production, running on Render, or configured with a live Paystack key.
  // In development: Only allowed if explicitly requested via PAYSTACK_MOCK_MODE === 'true' AND NOT using a live key.
  PAYSTACK_MOCK_MODE: (isProduction || isLiveKey)
    ? false
    : process.env.PAYSTACK_MOCK_MODE === 'true',

  // Storage
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),

  // Email
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'mock',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@mvplaunch.ng',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '2525', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || ''
};

module.exports = env;
