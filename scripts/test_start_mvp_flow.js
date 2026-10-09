/**
 * MVPLaunch NG - Complete "Start MVP" Flow Integration Test
 * Simulates:
 * 1. Start MVP -> Sign In/Register -> Create Account -> Register -> Authenticated State -> Package / Project Flow
 * 2. Start MVP -> Sign In/Register -> Sign In -> Authenticated State -> Package / Project Flow
 */
const http = require('http');
const db = require('../src/config/db');

const API_BASE = 'http://localhost:5005/api/v1';

async function makeRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const json = rawData ? JSON.parse(rawData) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: rawData });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runFlowTest() {
  console.log('\n======================================================');
  console.log('🚀 Testing Complete "Start MVP" User Flow');
  console.log('======================================================\n');

  const ts = Date.now();
  const email = `founder_${ts}@mvplaunch.test`;
  const password = 'NigerianFounder2026!';
  const fullName = 'Chioma Adeleke';
  const phoneNumber = '+234 814 555 6677';
  const selectedPackageId = 'founder-mvp';

  // --- Step 1: Browse Available Packages ---
  console.log('Step 1: User browses transparent launch packages...');
  const pkgRes = await makeRequest('/packages', { method: 'GET' });
  assert(pkgRes.status === 200, 'Packages endpoint reachable (status 200)');
  const packages = pkgRes.body?.data?.packages || [];
  assert(packages.length >= 4, `Found ${packages.length} transparent launch packages`);
  const founderPkg = packages.find(p => p.id === selectedPackageId);
  assert(founderPkg !== undefined, `Selected package "${selectedPackageId}" exists`);
  console.log(`Selected package: ${founderPkg.name} (₦${founderPkg.priceNgn?.toLocaleString()})`);

  // --- Step 2: User Clicks Start MVP -> Register ---
  console.log('\nStep 2: User clicks Start MVP -> Register Account...');
  const regRes = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName,
      phoneNumber,
      role: 'Client / Founder (I have an idea to build)', // tests display role normalization
      email,
      password
    }
  });

  console.log('Registration response:', regRes.status, regRes.body);
  assert(regRes.status === 201, `Registration successful (status ${regRes.status})`);
  assert(regRes.body?.data?.token, 'Authentication token issued');
  assert(regRes.body?.data?.user?.email === email, 'User created with email');
  assert(regRes.body?.data?.user?.role === 'CLIENT', 'Normalized role is CLIENT');
  const token = regRes.body.data.token;
  const user = regRes.body.data.user;

  // --- Step 3: Verify Authenticated State Persists ---
  console.log('\nStep 3: Verifying authenticated session persistence...');
  const meRes = await makeRequest('/auth/me', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(meRes.status === 200, 'Session verified via /auth/me');
  assert(meRes.body?.data?.user?.id === user.id, 'Session belongs to registered user');

  // --- Step 4: Continue Selected Package Checkout ---
  console.log('\nStep 4: Continuing Start MVP flow with selected package checkout...');
  const checkoutRes = await makeRequest('/payments/initialize-package', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: {
      packageId: selectedPackageId,
      customerName: user.fullName || user.full_name,
      customerEmail: user.email,
      customerPhone: user.phoneNumber || user.phone_number,
      notes: 'Fintech retail storefront for Computer Village merchants',
      callbackUrl: 'http://localhost:3000/payments/callback'
    }
  });

  assert(checkoutRes.status === 200 || checkoutRes.status === 201, `Checkout initialized (status ${checkoutRes.status})`);
  assert(checkoutRes.body?.data?.orderId, 'Order created in database');
  assert(checkoutRes.body?.data?.reference, 'Paystack transaction reference generated');
  const orderId = checkoutRes.body.data.orderId;
  const payRef = checkoutRes.body.data.reference;
  console.log(`Generated Order ID: ${orderId}, Paystack Ref: ${payRef}`);

  // --- Step 5: Verify Order in Database ---
  console.log('\nStep 5: Verifying order in database...');
  const dbOrder = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  assert(dbOrder.rows.length === 1, 'Order record exists in database');
  assert(dbOrder.rows[0].customer_email === email, 'Order linked to user email');
  assert(dbOrder.rows[0].package_id === selectedPackageId, 'Order matches selected package');

  // --- Step 6: Test Existing User Login Flow ---
  console.log('\nStep 6: Testing Existing User Sign In & Continue Flow...');
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email,
      password
    }
  });
  assert(loginRes.status === 200, 'Login succeeded with credentials');
  assert(loginRes.body?.data?.token, 'New session token received');
  const loginToken = loginRes.body.data.token;

  // Verify orders accessible after login
  const ordersRes = await makeRequest('/orders', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${loginToken}` }
  });
  assert(ordersRes.status === 200, 'Orders list accessible after login');
  const userOrders = Array.isArray(ordersRes.body?.data) ? ordersRes.body.data : (ordersRes.body?.data?.orders || []);
  assert(userOrders.some(o => o.id === orderId), 'Previously initialized order is present in user account');

  // Clean test records
  await db.query('DELETE FROM payments WHERE order_id = $1', [orderId]);
  await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  await db.query('DELETE FROM users WHERE email = $1', [email]);

  console.log('\n======================================================');
  console.log('🎉 COMPLETE "START MVP" FLOW TEST PASSED PERFECTLY!');
  console.log('======================================================\n');
  process.exit(0);
}

runFlowTest().catch(err => {
  console.error('\n❌ ERROR:', err);
  process.exit(1);
});
