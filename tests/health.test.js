/**
 * Automated Tests: Health & Root Endpoints
 */
const request = require('supertest');
const app = require('../src/app');

describe('API Health and Root Endpoints', () => {
  it('GET / should return service info and documentation link', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('MVPLaunch NG');
    expect(res.body.documentation).toBe('/api-docs');
    expect(res.body.apiPrefix).toBe('/api/v1');
  });

  it('GET /api/v1/health should return 200 with service health payload', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('MVPLaunch NG API');
    expect(res.body.data.version).toBe('1.0.0');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('GET /api/v1/non-existent-route should return 404 with structured error', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('does not exist');
  });
});
