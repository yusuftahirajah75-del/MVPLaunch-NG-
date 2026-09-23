/**
 * Automated Tests: Authentication & Security Tokens
 */
const { signToken, verifyToken } = require('../src/utils/token');
const { hashPassword, comparePassword } = require('../src/utils/password');
const request = require('supertest');
const app = require('../src/app');

describe('Authentication & Security Utilities', () => {
  describe('Password Hashing', () => {
    it('should correctly hash and verify passwords using bcrypt', async () => {
      const password = 'SuperSecurePassword2026!';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword123!', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Handling', () => {
    it('should sign and verify valid JWT token', () => {
      const payload = { id: '11111111-1111-1111-1111-111111111111', role: 'CLIENT' };
      const token = signToken(payload, '1h');

      expect(typeof token).toBe('string');
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
    });

    it('should fail verification on tampered JWT token', () => {
      const token = signToken({ id: '123' }, '1h');
      const tampered = token.slice(0, -5) + 'abcde';

      expect(() => verifyToken(tampered)).toThrow();
    });
  });

  describe('Protected Route Authentication Barrier', () => {
    it('GET /api/v1/auth/me should reject requests without token with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('GET /api/v1/projects should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/projects');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/v1/admin/metrics should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/admin/metrics');
      expect(res.statusCode).toBe(401);
    });
  });
});
