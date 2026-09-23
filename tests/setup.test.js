/**
 * Global Test Environment Sanity & Teardown
 */
describe('Test Environment Verification', () => {
  it('should have test environment initialized', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.PAYSTACK_MOCK_MODE).toBe('true');
  });

  afterAll(async () => {
    const db = require('../src/config/db');
    try {
      await db.pool.end();
    } catch (err) {
      // ignore
    }
  });
});
