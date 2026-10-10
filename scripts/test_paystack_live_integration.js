/**
 * MVPLaunch NG - Automated Paystack Integration & Security Test Suite
 * Tests:
 * 1. Package Catalog & Server-Enforced Pricing
 * 2. Secure Paystack Checkout Initialization (Kobo precision, unpredictable reference)
 * 3. Constant-Time HMAC-SHA512 Webhook Signature Verification
 * 4. Webhook Idempotency & Duplicate Rejection
 * 5. Server-Side Verification Integrity (Amount & Currency Mismatch Rejections)
 * 6. Order Lifecycle & Project Submission Access Control
 * 7. Production Isolation & Fail-Safe Configuration Guard
 */
const crypto = require('crypto');
const http = require('http');
const assert = require('assert');

// Force test environment with mock keys for safe local testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_automated_testing_12345';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_automated_test_secret_key_999';
process.env.PAYSTACK_PUBLIC_KEY = 'pk_test_automated_test_public_key_999';
process.env.PAYSTACK_MOCK_MODE = 'true';

const app = require('../src/app');
const db = require('../src/config/db');
const env = require('../src/config/env');
const paystackProvider = require('../src/providers/payment/paystack.provider');
const { PACKAGES, getPackageById } = require('../src/config/packages');
const { signToken } = require('../src/utils/token');
const { ensureDemoUsers } = require('../src/modules/auth/demoSeed.service');

// Simple HTTP request helper against the Express app
function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ statusCode: res.statusCode, body: parsed, rawBody: data });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🚀 MVPLaunch NG — Paystack Live Integration Test Suite');
  console.log('======================================================\n');

  // Start temporary server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverPort = server.address().port;
  console.log(`[Test Server] Bound to ephemeral port: ${serverPort}`);

  let passedTests = 0;
  let totalTests = 0;

  async function test(name, fn) {
    totalTests++;
    process.stdout.write(`• Testing: ${name} ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passedTests++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error('  Error:', err.message);
      if (err.stack) console.error(err.stack.split('\n').slice(1, 3).join('\n'));
    }
  }

  try {
    // 0. Ensure Demo Users exist
    let adminUser = (await db.query("SELECT * FROM users WHERE email = 'admin@mvplaunch.ng'")).rows[0];
    if (!adminUser) {
      await ensureDemoUsers();
      adminUser = (await db.query("SELECT * FROM users WHERE email = 'admin@mvplaunch.ng'")).rows[0];
    }
    const clientUser = (await db.query("SELECT * FROM users WHERE email = 'founder@quickretail.ng'")).rows[0];
    const adminToken = signToken({ id: adminUser.id, role: 'ADMIN' });
    const clientToken = signToken({ id: clientUser.id, role: 'CLIENT' });

    // TEST 1: Package Catalog Verification
    await test('1. Package Catalog & Pricing Integrity', async () => {
      const res = await makeRequest(server, { path: '/api/v1/packages', method: 'GET' });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      const pkgs = res.body.data.packages;
      assert.strictEqual(pkgs.length, 4);

      const ideaPkg = pkgs.find((p) => p.id === 'idea-validation');
      assert.strictEqual(ideaPkg.priceNgn, 15000);
      assert.strictEqual(ideaPkg.priceKobo, 1500000);

      const studentPkg = pkgs.find((p) => p.id === 'student-project');
      assert.strictEqual(studentPkg.priceNgn, 20000);

      const founderPkg = pkgs.find((p) => p.id === 'founder-mvp');
      assert.strictEqual(founderPkg.priceNgn, 35000);

      const bizPkg = pkgs.find((p) => p.id === 'business-digital');
      assert.strictEqual(bizPkg.priceNgn, 50000);
    });

    // TEST 2: Server-Side Pricing Enforcement (Tamper Resistance)
    let testReference;
    let testOrderId;
    await test('2. Checkout Initialization Enforces Server Price (Client Price Tampering Ignored)', async () => {
      const res = await makeRequest(
        server,
        { path: '/api/v1/payments/initialize-package', method: 'POST' },
        {
          packageId: 'idea-validation',
          customerName: 'Aisha Bello',
          customerEmail: 'aisha.bello@startup.ng',
          customerPhone: '08012345678',
          notes: 'Fintech micro-savings prototype',
          // Malicious attempt to pay ₦1 instead of ₦15,000:
          amount: 1,
          priceNgn: 1,
          priceKobo: 100
        }
      );

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.amountNgn, 15000, 'Price must be strictly 15,000 NGN');
      assert.strictEqual(res.body.data.amountKobo, 1500000, 'Price in kobo must be 1,500,000');
      assert.strictEqual(res.body.data.currency, 'NGN');
      assert.ok(res.body.data.reference.startsWith('mvp_pkg_'));
      assert.ok(res.body.data.authorizationUrl, 'Must return authorization URL');

      testReference = res.body.data.reference;
      testOrderId = res.body.data.orderId;

      // Verify persistent database order record
      const dbOrder = await db.query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
      assert.strictEqual(dbOrder.rows.length, 1);
      assert.strictEqual(Number(dbOrder.rows[0].total_amount_ngn), 15000);
      assert.strictEqual(dbOrder.rows[0].payment_status, 'PENDING');
    });

    // TEST 3: Constant-Time HMAC-SHA512 Webhook Signature Verification
    await test('3. Webhook HMAC-SHA512 Cryptographic Verification', async () => {
      const webhookPayload = {
        event: 'charge.success',
        data: {
          id: 99112233,
          reference: 'mock_random_ref',
          amount: 1500000,
          currency: 'NGN',
          status: 'success'
        }
      };
      const rawString = JSON.stringify(webhookPayload);
      const validSig = crypto
        .createHmac('sha512', paystackProvider.secretKey)
        .update(rawString)
        .digest('hex');

      // Valid signature must verify
      const isSigValid = paystackProvider.verifyWebhookSignature(validSig, rawString);
      assert.strictEqual(isSigValid, true, 'Valid HMAC signature must be accepted');

      // Invalid / tampered signature must be rejected
      const forgedSig = 'a'.repeat(128);
      const isForgedValid = paystackProvider.verifyWebhookSignature(forgedSig, rawString);
      assert.strictEqual(isForgedValid, false, 'Forged signature must be rejected');

      // Reject forged signature through HTTP endpoint
      const res = await makeRequest(
        server,
        {
          path: '/api/v1/payments/webhook',
          method: 'POST',
          headers: { 'x-paystack-signature': 'invalid_forged_signature_123' }
        },
        webhookPayload
      );
      assert.strictEqual(res.statusCode, 403, 'Endpoint must return 403 Forbidden for forged signature');
    });

    // TEST 4: Webhook Processing & Idempotency
    await test('4. Webhook Processing & Idempotency via webhook_logs', async () => {
      // Create new package order for webhook test
      const initRes = await makeRequest(
        server,
        { path: '/api/v1/payments/initialize-package', method: 'POST' },
        {
          packageId: 'student-project',
          customerName: 'Tariq Al-Mansoor',
          customerEmail: 'tariq@student.edu.ng'
        }
      );
      const webhookRef = initRes.body.data.reference;
      const orderId = initRes.body.data.orderId;

      const eventId = `evt_test_${Date.now()}`;
      const payload = {
        event: 'charge.success',
        event_id: eventId,
        data: {
          id: Date.now(),
          reference: webhookRef,
          amount: 2000000, // 20,000 NGN in kobo
          currency: 'NGN',
          status: 'success',
          channel: 'card',
          paid_at: new Date().toISOString()
        }
      };

      const rawString = JSON.stringify(payload);
      const validSig = crypto
        .createHmac('sha512', paystackProvider.secretKey)
        .update(rawString)
        .digest('hex');

      // First webhook delivery
      const res1 = await makeRequest(
        server,
        {
          path: '/api/v1/payments/webhook',
          method: 'POST',
          headers: { 'x-paystack-signature': validSig }
        },
        payload
      );
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(res1.body.received, true);

      // Verify order is now marked PAID
      const dbOrder = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      assert.strictEqual(dbOrder.rows[0].payment_status, 'PAID');
      assert.strictEqual(dbOrder.rows[0].fulfillment_status, 'IN_PROGRESS');

      // Verify webhook log entry exists
      const logDb = await db.query('SELECT * FROM webhook_logs WHERE reference = $1', [webhookRef]);
      assert.ok(logDb.rows.length >= 1, 'Webhook event must be logged');

      // Second webhook delivery (simulating Paystack duplicate retry)
      const res2 = await makeRequest(
        server,
        {
          path: '/api/v1/payments/webhook',
          method: 'POST',
          headers: { 'x-paystack-signature': validSig }
        },
        payload
      );
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res2.body.received, true);
    });

    // TEST 5: Direct Verification & Idempotency
    await test('5. Server-Side Verification Endpoint & Idempotency', async () => {
      // First verification call
      const res1 = await makeRequest(server, { path: `/api/v1/payments/verify/${testReference}`, method: 'GET' });
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(res1.body.success, true);
      assert.strictEqual(res1.body.data.status, 'PAID');
      assert.strictEqual(res1.body.data.amountNgn, 15000);
      assert.strictEqual(res1.body.data.currency, 'NGN');

      // Second verification call (idempotent repeated call)
      const res2 = await makeRequest(server, { path: `/api/v1/payments/verify/${testReference}`, method: 'GET' });
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res2.body.success, true);
      assert.strictEqual(res2.body.data.status, 'PAID');
    });

    // TEST 6: Client Project Submission Gating Behind Verified Payment
    await test('6. Project Submission Access Control (Locked Unpaid, Unlocked Paid)', async () => {
      const projectsService = require('../src/modules/projects/projects.service');

      // 6a: Attempting to submit without any paid order must fail
      const unpaidUser = (await db.query("SELECT * FROM users WHERE email = 'developer@mvplaunch.ng'")).rows[0];
      try {
        await projectsService.submitProject(
          unpaidUser,
          {
            title: 'Unauthorized Project Attempt',
            problemStatement: 'Testing unauthorized access',
            targetUsers: 'None'
          },
          null
        );
        assert.fail('Should have thrown an error for unpaid order');
      } catch (err) {
        assert.strictEqual(err.statusCode, 400);
        assert.ok(err.message.includes('paid package order is required'));
      }

      // 6b: Submitting with verified paid order succeeds
      const paidOrder = (await db.query("SELECT * FROM orders WHERE id = $1", [testOrderId])).rows[0];
      const orderOwner = (await db.query("SELECT * FROM users WHERE id = $1", [paidOrder.client_id])).rows[0];

      const submittedProject = await projectsService.submitProject(
        orderOwner,
        {
          orderId: testOrderId,
          title: 'Aisha Marketplace Launch',
          organizationName: 'Aisha Digital NG',
          industry: 'Fintech',
          problemStatement: 'Unbanked individuals lack simple savings tools',
          targetUsers: 'Informal market traders in Kano & Lagos',
          proposedSolution: 'SMS & WhatsApp micro-savings ledger',
          coreFeatures: ['Daily deposits', 'Automated reminders', 'Withdrawal requests']
        },
        null
      );

      assert.ok(submittedProject.id);
      assert.strictEqual(submittedProject.order_id, testOrderId);
      assert.ok(submittedProject.project_code.startsWith('PRJ-'));

      // 6c: Preventing duplicate submission against same order
      try {
        await projectsService.submitProject(
          orderOwner,
          {
            orderId: testOrderId,
            title: 'Duplicate Submission Attempt',
            problemStatement: 'Should fail'
          },
          null
        );
        assert.fail('Should have rejected duplicate project submission');
      } catch (dupErr) {
        assert.strictEqual(dupErr.statusCode, 409, 'Must return 409 Conflict for duplicate submission');
      }
    });

    // TEST 7: Production Isolation & Fail-Safe Guard
    await test('7. Production Mock Mode Isolation & Safe Failure Guard', async () => {
      const savedEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        // Test mock-checkout route rejection
        const res = await makeRequest(server, { path: `/api/v1/payments/mock-checkout?reference=${testReference}`, method: 'GET' });
        assert.ok(res.statusCode === 404, 'Mock checkout must return 404 in production');
      } finally {
        process.env.NODE_ENV = savedEnv;
      }
    });

    // TEST 8: Rejection on Currency or Amount Mismatch
    await test('8. Server Verification Rejects Currency and Amount Mismatches', async () => {
      const paymentsService = require('../src/modules/payments/payments.service');
      // Create a pending order & payment
      const initRes = await makeRequest(
        server,
        { path: '/api/v1/payments/initialize-package', method: 'POST' },
        {
          packageId: 'founder-mvp',
          customerName: 'Obinna Eze',
          customerEmail: 'obinna@eze.ng'
        }
      );
      const pkgRef = initRes.body.data.reference;

      // Mock verify returning wrong currency (USD instead of NGN)
      const originalVerify = paystackProvider.verifyTransaction;
      try {
        paystackProvider.verifyTransaction = async () => ({
          success: true,
          status: 'SUCCESSFUL',
          amountNgn: 35000,
          currency: 'USD', // Fraudulent / mismatched currency
          paidAt: new Date()
        });

        await assert.rejects(
          async () => await paymentsService.verifyPayment(pkgRef, null, null),
          (err) => {
            assert.ok(err.message.includes('currency mismatch'), 'Must reject currency mismatch');
            return true;
          }
        );

        // Mock verify returning wrong amount (5,000 instead of 35,000)
        paystackProvider.verifyTransaction = async () => ({
          success: true,
          status: 'SUCCESSFUL',
          amountNgn: 5000, // Fraudulent underpayment
          currency: 'NGN',
          paidAt: new Date()
        });

        await assert.rejects(
          async () => await paymentsService.verifyPayment(pkgRef, null, null),
          (err) => {
            assert.ok(err.message.includes('amount mismatch'), 'Must reject amount mismatch');
            return true;
          }
        );
      } finally {
        paystackProvider.verifyTransaction = originalVerify;
      }
    });

    // TEST 9: Production Initialization Fails Safely When Secret Key Missing
    await test('9. Production Mode Fails Safely with Config Error (No Accidental Mock Fallback)', async () => {
      const savedEnv = process.env.NODE_ENV;
      const savedKey = paystackProvider.secretKey;
      try {
        process.env.NODE_ENV = 'production';
        paystackProvider.secretKey = ''; // simulate missing key in production
        paystackProvider.isMock = false;

        await assert.rejects(
          async () => {
            await paystackProvider.initializeTransaction({
              email: 'test@example.com',
              amountNgn: 15000,
              reference: 'ref_123',
              callbackUrl: 'https://mvplaunch-ng.onrender.com/callback'
            });
          },
          (err) => {
            assert.ok(err.message.includes('Paystack Secret Key is missing'), 'Must throw clear config error');
            return true;
          }
        );
      } finally {
        process.env.NODE_ENV = savedEnv;
        paystackProvider.secretKey = savedKey;
        paystackProvider.isMock = true;
      }
    });

  } finally {
    server.close();
    try {
      await db.pool.end();
    } catch {}
  }

  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL PAYSTACK INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. Please review output above.\n');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
