/**
 * Automated Tests: Request Validation Middleware & Zod Schemas
 */
const request = require('supertest');
const app = require('../src/app');

describe('Zod Validation Middleware', () => {
  describe('POST /api/v1/auth/register validation', () => {
    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'invalid-email-string',
        password: 'Password123!',
        fullName: 'Test User'
      });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' })
        ])
      );
    });

    it('should reject registration with weak password (missing uppercase/number/short)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'user@test.ng',
        password: 'weak',
        fullName: 'Test User'
      });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' })
        ])
      );
    });

    it('should reject registration with missing required fields', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/v1/auth/login validation', () => {
    it('should reject empty login payload', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
