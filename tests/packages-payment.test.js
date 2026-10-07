/**
 * MVPLaunch NG: Comprehensive Automated Tests
 * Packages, Paystack Checkout Flow, Verification, Webhooks & Admin Orders Management
 */
const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const paystackProvider = require('../src/providers/payment/paystack.provider');
const { PACKAGES } = require('../src/config/packages');
const { signToken } = require('../src/utils/token');
const { ensureDemoUsers } = require('../src/modules/auth/demoSeed.service');

describe('Packages and Paystack Payment Integration', () => {
  let adminToken;
  let clientToken;
  let adminUser;
  let clientUser;

  beforeAll(async () => {
    // Ensure pre-seeded demo accounts exist in the database with valid password hashes
    await ensureDemoUsers();

    const adminRes = await db.query("SELECT * FROM users WHERE email = 'admin@mvplaunch.ng'");
    adminUser = adminRes.rows[0];
    adminToken = signToken({ id: adminUser.id, role: 'ADMIN' });

    const clientRes = await db.query("SELECT * FROM users WHERE email = 'founder@quickretail.ng'");
    clientUser = clientRes.rows[0];
    clientToken = signToken({ id: clientUser.id, role: 'CLIENT' });
  });

  afterAll(async () => {
    try {
      await db.pool.end();
    } catch (e) {
      // ignore
    }
  });

  describe('1. Package Catalog API (GET /api/v1/packages)', () => {
    it('should return all four customer-focused packages with accurate naira prices and configurations', async () => {
      const res = await request(app).get('/api/v1/packages');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.packages)).toBe(true);
      expect(res.body.data.packages.length).toBe(4);

      const packages = res.body.data.packages;
      const ideaPkg = packages.find(p => p.id === 'idea-validation');
      const studentPkg = packages.find(p => p.id === 'student-project');
      const founderPkg = packages.find(p => p.id === 'founder-mvp');
      const businessPkg = packages.find(p => p.id === 'business-digital');

      // Assert Idea Validation Starter (₦15,000)
      expect(ideaPkg).toBeDefined();
      expect(ideaPkg.name).toBe('Idea Validation Starter');
      expect(ideaPkg.priceNgn).toBe(15000);
      expect(ideaPkg.priceKobo).toBe(1500000);
      expect(ideaPkg.features.length).toBeGreaterThanOrEqual(4);
      expect(ideaPkg.exclusions.length).toBeGreaterThan(0);

      // Assert Student Project Launch (₦20,000)
      expect(studentPkg).toBeDefined();
      expect(studentPkg.name).toBe('Student Project Launch');
      expect(studentPkg.priceNgn).toBe(20000);
      expect(studentPkg.priceKobo).toBe(2000000);
      expect(studentPkg.targetAudience).toContain('students');
      expect(studentPkg.features.length).toBeGreaterThan(0);
      expect(studentPkg.exclusions.length).toBeGreaterThan(0);

      // Assert Founder MVP Launch (₦35,000)
      expect(founderPkg).toBeDefined();
      expect(founderPkg.name).toBe('Founder MVP Launch');
      expect(founderPkg.priceNgn).toBe(35000);
      expect(founderPkg.priceKobo).toBe(3500000);
      expect(founderPkg.popular).toBe(true);
      expect(founderPkg.targetAudience).toContain('founders');

      // Assert Business Digital Launch (₦50,000)
      expect(businessPkg).toBeDefined();
      expect(businessPkg.name).toBe('Business Digital Launch');
      expect(businessPkg.priceNgn).toBe(50000);
      expect(businessPkg.priceKobo).toBe(5000000);
      expect(businessPkg.targetAudience).toContain('SMEs');
    });

    it('should return a specific package by ID (supporting both hyphens, underscores, and aliases)', async () => {
      const res = await request(app).get('/api/v1/packages/idea-validation');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.package.id).toBe('idea-validation');
      expect(res.body.data.package.priceNgn).toBe(15000);

      const res2 = await request(app).get('/api/v1/packages/FOUNDER_MVP');
      expect(res2.statusCode).toBe(200);
      expect(res2.body.data.package.id).toBe('founder-mvp');
      expect(res2.body.data.package.priceNgn).toBe(35000);

      // Legacy alias check
      const res3 = await request(app).get('/api/v1/packages/mvp-starter');
      expect(res3.statusCode).toBe(200);
      expect(res3.body.data.package.id).toBe('founder-mvp');
    });

    it('should return 404 for an invalid package ID', async () => {
      const res = await request(app).get('/api/v1/packages/non-existent-package');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Payment Initialization Security & Server Pricing Enforcement', () => {
    it('should reject requests with missing or invalid package ID with 422', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'unknown-fake-package',
          customerName: 'Chidi Okonkwo',
          customerEmail: 'chidi@example.com'
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject requests with invalid email address format with 422', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'idea-validation',
          customerName: 'Chidi Okonkwo',
          customerEmail: 'not-a-valid-email'
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should initialize Idea Validation Starter (₦15,000) and ignore client-tampered price', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'idea-validation',
          customerName: 'Amina Bello',
          customerEmail: 'amina.bello@idea.ng',
          customerPhone: '08012345678',
          notes: 'Fintech idea validation for Nigerian unbanked',
          // Malicious client tries to send tampered price of 1 naira:
          amount: 1,
          priceNgn: 1,
          priceKobo: 100
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('authorizationUrl');
      expect(res.body.data).toHaveProperty('reference');
      expect(res.body.data).toHaveProperty('orderId');

      // Server must enforce trusted price of 15,000 NGN
      expect(res.body.data.amountNgn).toBe(15000);
      expect(res.body.data.amountKobo).toBe(1500000);
      expect(res.body.data.currency).toBe('NGN');

      // Check order in DB to confirm price in database is 15000
      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [res.body.data.orderId]);
      expect(orderRes.rows.length).toBe(1);
      expect(Number(orderRes.rows[0].total_amount_ngn)).toBe(15000);
      expect(orderRes.rows[0].payment_status).toBe('PENDING');
      expect(orderRes.rows[0].package_id).toBe('idea-validation');
    });

    it('should initialize Business Digital Launch package (₦50,000) successfully', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'business-digital',
          customerName: 'Emeka Nwosu',
          customerEmail: 'emeka@ventures.ng',
          customerPhone: '08098765432',
          notes: 'Corporate landing page for logistics firm'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.amountNgn).toBe(50000);
      expect(res.body.data.amountKobo).toBe(5000000);
      expect(res.body.data.reference).toMatch(/^mvp_pkg_/);
    });
  });

  describe('3. Payment Verification & Idempotency', () => {
    let testReference;
    let testOrderId;

    beforeEach(async () => {
      const initRes = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'founder-mvp',
          customerName: 'Tunde Bakare',
          customerEmail: 'tunde@bakaretech.ng',
          customerPhone: '08123456789',
          notes: 'SaaS MVP prototype'
        });

      testReference = initRes.body.data.reference;
      testOrderId = initRes.body.data.orderId;
    });

    it('should reject verification of an invalid or nonexistent reference', async () => {
      const res = await request(app).get('/api/v1/payments/verify/non_existent_ref_99999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should verify payment, transition order to PAID, and set fulfillment to IN_PROGRESS', async () => {
      const res = await request(app).get(`/api/v1/payments/verify/${testReference}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toBe(testReference);
      expect(res.body.data.status).toBe('PAID');
      expect(res.body.data.amountNgn).toBe(35000);
      expect(res.body.data.currency).toBe('NGN');

      // Verify database state directly
      const orderDb = await db.query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
      expect(orderDb.rows[0].payment_status).toBe('PAID');
      expect(orderDb.rows[0].fulfillment_status).toBe('IN_PROGRESS');

      const paymentDb = await db.query('SELECT * FROM payments WHERE provider_reference = $1', [testReference]);
      expect(paymentDb.rows[0].status).toBe('VERIFIED');
    });

    it('should be safe and idempotent on repeated verification calls', async () => {
      // First verification call
      const res1 = await request(app).get(`/api/v1/payments/verify/${testReference}`);
      expect(res1.statusCode).toBe(200);

      // Second immediate verification call with same reference
      const res2 = await request(app).get(`/api/v1/payments/verify/${testReference}`);
      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.data.status).toBe('PAID');
    });
  });

  describe('4. Paystack Webhook Security & Idempotency', () => {
    it('should reject webhook with invalid signature with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', 'forged_tampered_signature')
        .send({
          event: 'charge.success',
          data: { reference: 'some_ref' }
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should accept valid signed webhook, mark order paid, and prevent duplicate fulfillment', async () => {
      // Create a pending order first
      const initRes = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'student-project',
          customerName: 'Fatima Sanusi',
          customerEmail: 'fatima@student.ng'
        });

      const webhookRef = initRes.body.data.reference;
      const orderId = initRes.body.data.orderId;

      // Construct Paystack charge.success payload
      const testEventId = Date.now() + Math.floor(Math.random() * 100000);
      const webhookPayload = {
        event: 'charge.success',
        data: {
          id: testEventId,
          reference: webhookRef,
          amount: 2000000, // 20,000 NGN in kobo
          currency: 'NGN',
          status: 'success',
          channel: 'card',
          paid_at: new Date().toISOString()
        }
      };

      const rawPayload = JSON.stringify(webhookPayload);
      const signature = crypto
        .createHmac('sha512', paystackProvider.secretKey)
        .update(rawPayload)
        .digest('hex');

      // First webhook call
      const res1 = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', signature)
        .set('Content-Type', 'application/json')
        .send(webhookPayload);

      expect(res1.statusCode).toBe(200);
      expect(res1.body.received).toBe(true);

      // Verify DB order status is now PAID
      const orderDb = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      expect(orderDb.rows[0].payment_status).toBe('PAID');

      // Verify webhook log exists
      const logDb = await db.query('SELECT * FROM webhook_logs WHERE reference = $1', [webhookRef]);
      expect(logDb.rows.length).toBeGreaterThanOrEqual(1);

      // Second webhook call (simulating Paystack retry)
      const res2 = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', signature)
        .set('Content-Type', 'application/json')
        .send(webhookPayload);

      expect(res2.statusCode).toBe(200);
      expect(res2.body.received).toBe(true);
    });
  });

  describe('5. Admin Orders Management & Authorization Guards', () => {
    it('should reject unauthenticated request to GET /api/v1/admin/orders with 401', async () => {
      const res = await request(app).get('/api/v1/admin/orders');
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-admin users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow authorized admin to retrieve orders list and view package details', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);

      // Confirm order fields required by Admin are returned
      const order = res.body.data.orders[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('total_amount_ngn');
      expect(order).toHaveProperty('payment_status');
      expect(order).toHaveProperty('fulfillment_status');
    });

    it('should allow authorized admin to update order fulfillment status', async () => {
      // Create a test order
      const initRes = await request(app)
        .post('/api/v1/payments/initialize-package')
        .send({
          packageId: 'founder-mvp',
          customerName: 'Kola Ojo',
          customerEmail: 'kola@ojo.ng'
        });

      const orderId = initRes.body.data.orderId;

      const patchRes = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fulfillmentStatus: 'DELIVERED' });

      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.order.fulfillment_status).toBe('DELIVERED');

      // Verify in DB
      const dbCheck = await db.query('SELECT fulfillment_status FROM orders WHERE id = $1', [orderId]);
      expect(dbCheck.rows[0].fulfillment_status).toBe('DELIVERED');
    });
  });
});
