/**
 * MVPLaunch NG - Demo Authentication & Role Verification Suite
 * Verifies that all pre-seeded demo accounts authenticate correctly,
 * reject invalid passwords with 401 (not 500), return valid JWT tokens,
 * and access role-specific endpoints.
 */
const request = require('supertest');
const app = require('../src/app');
const { DEMO_ACCOUNTS, ensureDemoUsers } = require('../src/modules/auth/demoSeed.service');
const db = require('../src/config/db');

describe('Instant Demo Logins & Authentication Verification', () => {
  beforeAll(async () => {
    // Ensure demo accounts are seeded with valid bcrypt hashes
    await ensureDemoUsers();
  });

  describe('1. Pre-seeded Demo Accounts Existence & Credentials', () => {
    it.each(DEMO_ACCOUNTS)(
      'should successfully sign in demo account: $email ($role)',
      async ({ email, password, role }) => {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user.email.toLowerCase()).toBe(email.toLowerCase());
        expect(res.body.data.user.role).toBe(role);
        expect(res.body.data.user.isActive).toBe(true);
      }
    );
  });

  describe('2. Authentication Error Boundaries (distinguish 401 from 500)', () => {
    it('should return 401 Unauthorized for incorrect password, NOT HTTP 500', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@mvplaunch.ng',
          password: 'CompletelyWrongPassword999!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
      expect(res.statusCode).not.toBe(500);
    });

    it('should return 401 Unauthorized for non-existent user, NOT HTTP 500', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent.user.2026@mvplaunch.ng',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.statusCode).not.toBe(500);
    });
  });

  describe('3. Validation Boundaries (distinguish 422 from 500)', () => {
    it('should return 422 for missing password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'founder@quickretail.ng' });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'password' })])
      );
    });

    it('should return 422 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'Password123!' });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Session & Role-Based Access Control (RBAC)', () => {
    it('CLIENT should access /api/v1/auth/me and have CLIENT role', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'founder@quickretail.ng', password: 'ClientPass123!' });

      const token = loginRes.body.data.token;
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body.data.user.role).toBe('CLIENT');
    });

    it('DEVELOPER should access /api/v1/auth/me and have DEVELOPER role', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'developer@mvplaunch.ng', password: 'DevPass123!' });

      const token = loginRes.body.data.token;
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body.data.user.role).toBe('DEVELOPER');
    });

    it('ADMIN should access /api/v1/admin/metrics successfully', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@mvplaunch.ng', password: 'AdminPass123!' });

      const token = loginRes.body.data.token;
      const adminRes = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${token}`);

      expect(adminRes.statusCode).toBe(200);
      expect(adminRes.body.success).toBe(true);
    });

    it('CLIENT should be FORBIDDEN (403) from accessing admin metrics', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'founder@quickretail.ng', password: 'ClientPass123!' });

      const token = loginRes.body.data.token;
      const adminRes = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${token}`);

      expect(adminRes.statusCode).toBe(403);
      expect(adminRes.body.success).toBe(false);
    });
  });

  describe('5. Idempotent Seeding Repeatability', () => {
    it('running ensureDemoUsers multiple times must NOT duplicate users or corrupt passwords', async () => {
      // Run once more
      await ensureDemoUsers();
      await ensureDemoUsers();

      // Verify count of admin@mvplaunch.ng is exactly 1
      const countRes = await db.query(
        `SELECT COUNT(*) as count FROM users WHERE LOWER(email) = LOWER($1)`,
        ['admin@mvplaunch.ng']
      );
      expect(parseInt(countRes.rows[0].count, 10)).toBe(1);

      // Verify login still works
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@mvplaunch.ng', password: 'AdminPass123!' });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });
  });

  describe('6. Normal User Registration & Authentication Flow', () => {
    it('should register a new unique client, log in, and retrieve profile', async () => {
      const uniqueEmail = `test.user.${Date.now()}@example.ng`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'StrongPassword123!',
          fullName: 'Chukwudi Test',
          phoneNumber: '+2348011223344',
          role: 'CLIENT'
        });

      expect(regRes.statusCode).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user.email).toBe(uniqueEmail);

      // Log in with new credentials
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: uniqueEmail,
          password: 'StrongPassword123!'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();

      // Clean up test user
      await db.query(`DELETE FROM users WHERE email = $1`, [uniqueEmail]);
    });
  });
});
