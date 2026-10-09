/**
 * MVPLaunch NG - End-to-End Authentication and User Flow Verification Test
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

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 Running MVPLaunch NG Authentication Verification Suite');
  console.log('======================================================\n');

  const timestamp = Date.now();
  const testClientEmail = `client_${timestamp}@mvplaunch.test`;
  const testDevEmail = `dev_${timestamp}@mvplaunch.test`;
  const testPassword = 'Password123!';

  // Clean any leftover test records
  await db.query(`DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_email LIKE '%@mvplaunch.test')`);
  await db.query(`DELETE FROM orders WHERE customer_email LIKE '%@mvplaunch.test'`);
  await db.query(`DELETE FROM users WHERE email LIKE '%@mvplaunch.test'`);

  // --- Test 1: Valid Client Registration ---
  console.log('\n--- 1. Testing Valid Client Registration ---');
  const res1 = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Amina Bello',
      phoneNumber: '+234 803 123 4567',
      role: 'CLIENT',
      email: testClientEmail,
      password: testPassword
    }
  });

  assert(res1.status === 201, `Status is 201 Created (got ${res1.status})`);
  assert(res1.body?.success === true, 'Response success is true');
  assert(res1.body?.data?.user?.email === testClientEmail, 'User email matches');
  assert(res1.body?.data?.user?.fullName === 'Amina Bello', 'User fullName matches');
  assert(res1.body?.data?.user?.role === 'CLIENT', 'User role is CLIENT');
  assert(res1.body?.data?.token, 'Token is returned');
  assert(!res1.body?.data?.user?.password && !res1.body?.data?.user?.password_hash, 'Password hash is NOT exposed');
  const clientToken = res1.body.data.token;

  // --- Test 2: Valid Developer Registration ---
  console.log('\n--- 2. Testing Valid Developer Registration ---');
  const res2 = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Emeka Okafor',
      phoneNumber: '+234 814 987 6543',
      role: 'DEVELOPER',
      email: testDevEmail,
      password: testPassword
    }
  });

  assert(res2.status === 201, `Status is 201 Created (got ${res2.status})`);
  assert(res2.body?.data?.user?.role === 'DEVELOPER', 'User role is DEVELOPER');

  // --- Test 3: Role display label mapping ---
  console.log('\n--- 3. Testing Role Display Label Normalization ---');
  const res3a = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Tunde Client',
      role: 'Client / Founder (I have an idea to build)',
      email: `tunde_client_${timestamp}@mvplaunch.test`,
      password: testPassword
    }
  });
  assert(res3a.status === 201, 'Client display label mapped to CLIENT (status 201)');
  assert(res3a.body?.data?.user?.role === 'CLIENT', 'Role is CLIENT');

  const res3b = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Folake Dev',
      role: 'MVP Developer (I want to build vetted projects)',
      email: `folake_dev_${timestamp}@mvplaunch.test`,
      password: testPassword
    }
  });
  assert(res3b.status === 201, 'Developer display label mapped to DEVELOPER (status 201)');
  assert(res3b.body?.data?.user?.role === 'DEVELOPER', 'Role is DEVELOPER');

  // --- Test 4: Optional Phone field handling ---
  console.log('\n--- 4. Testing Optional Phone Number Normalization ---');
  const res4 = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'No Phone User',
      email: `nophone_${timestamp}@mvplaunch.test`,
      password: testPassword,
      phoneNumber: '   ' // whitespace should become null
    }
  });
  assert(res4.status === 201, 'Whitespace phone handled safely (status 201)');
  assert(res4.body?.data?.user?.phoneNumber === null, 'phoneNumber is null');

  // --- Test 5: Validation - Invalid Email ---
  console.log('\n--- 5. Testing Validation Error on Invalid Email ---');
  const res5 = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Bad Email User',
      email: 'not-an-email',
      password: testPassword,
      role: 'CLIENT'
    }
  });
  assert(res5.status === 422, `Status is 422 Unprocessable (got ${res5.status})`);
  assert(res5.body?.message?.includes('valid email address'), `Clear validation error message: "${res5.body?.message}"`);

  // --- Test 6: Validation - Weak/Invalid Passwords ---
  console.log('\n--- 6. Testing Validation on Weak Passwords ---');
  // Too short
  const res6a = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Short Pass',
      email: `shortpass_${timestamp}@mvplaunch.test`,
      password: 'Pass1', // 5 chars
      role: 'CLIENT'
    }
  });
  assert(res6a.status === 422, 'Password < 8 chars returns 422');
  assert(res6a.body?.message?.includes('at least 8 characters'), `Message: "${res6a.body?.message}"`);

  // Missing uppercase
  const res6b = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'No Upper Pass',
      email: `noupper_${timestamp}@mvplaunch.test`,
      password: 'password123',
      role: 'CLIENT'
    }
  });
  assert(res6b.status === 422, 'Password missing uppercase returns 422');
  assert(res6b.body?.message?.includes('uppercase'), `Message: "${res6b.body?.message}"`);

  // Missing number
  const res6c = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'No Number Pass',
      email: `nonumber_${timestamp}@mvplaunch.test`,
      password: 'PasswordSecret',
      role: 'CLIENT'
    }
  });
  assert(res6c.status === 422, 'Password missing number returns 422');
  assert(res6c.body?.message?.includes('number'), `Message: "${res6c.body?.message}"`);

  // --- Test 7: Validation - Missing Required Fields ---
  console.log('\n--- 7. Testing Missing Required Fields ---');
  const res7a = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      email: `nofullname_${timestamp}@mvplaunch.test`,
      password: testPassword
    }
  });
  assert(res7a.status === 422, 'Missing fullName returns 422');

  const res7b = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'No Password User',
      email: `nopass_${timestamp}@mvplaunch.test`
    }
  });
  assert(res7b.status === 422, 'Missing password returns 422');

  // --- Test 8: Duplicate Email Conflict ---
  console.log('\n--- 8. Testing Duplicate Email Handling ---');
  const res8 = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Duplicate Amina',
      email: testClientEmail, // already exists from Test 1
      password: testPassword,
      role: 'CLIENT'
    }
  });
  assert(res8.status === 409, `Duplicate email returns 409 Conflict (got ${res8.status})`);
  assert(res8.body?.message?.includes('already exists'), `Clear duplicate message: "${res8.body?.message}"`);

  // --- Test 9: Invalid Role ---
  console.log('\n--- 9. Testing Invalid Role Rejection ---');
  const res9 = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Bad Role User',
      email: `badrole_${timestamp}@mvplaunch.test`,
      password: testPassword,
      role: 'SUPERADMIN'
    }
  });
  assert(res9.status === 422, `Invalid role returns 422 (got ${res9.status})`);

  // --- Test 10: Existing User Sign In ---
  console.log('\n--- 10. Testing Existing User Login ---');
  // Success
  const res10a = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email: `  ${testClientEmail.toUpperCase()}  `, // Test trim & lowercase
      password: testPassword
    }
  });
  assert(res10a.status === 200, `Login returns 200 OK (got ${res10a.status})`);
  assert(res10a.body?.data?.user?.email === testClientEmail, 'Logged in user email matches');
  assert(res10a.body?.data?.token, 'Login returns valid token');

  // Wrong password
  const res10b = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email: testClientEmail,
      password: 'WrongPassword999!'
    }
  });
  assert(res10b.status === 401, `Wrong password returns 401 Unauthorized (got ${res10b.status})`);
  assert(res10b.body?.message?.includes('Invalid email or password'), `Message: "${res10b.body?.message}"`);

  // Non-existent email
  const res10c = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email: 'nonexistent@mvplaunch.test',
      password: testPassword
    }
  });
  assert(res10c.status === 401, `Nonexistent user returns 401 Unauthorized (got ${res10c.status})`);

  // --- Test 11: Authenticated Session Persistence (/auth/me) ---
  console.log('\n--- 11. Testing Session Persistence via /auth/me ---');
  const res11 = await makeRequest('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${clientToken}`
    }
  });
  assert(res11.status === 200, `Profile retrieved with token (got ${res11.status})`);
  assert(res11.body?.data?.user?.email === testClientEmail, 'Current user profile matches');

  // --- Test 12: Database Integrity Check ---
  console.log('\n--- 12. Testing Database Record Integrity ---');
  const dbUser = await db.query('SELECT * FROM users WHERE email = $1', [testClientEmail]);
  assert(dbUser.rows.length === 1, 'User record exists in PostgreSQL database');
  const row = dbUser.rows[0];
  assert(row.password_hash.startsWith('$2a$') || row.password_hash.startsWith('$2b$'), 'Password is encrypted using bcrypt');
  assert(!row.password_hash.includes(testPassword), 'Plaintext password is NEVER stored');
  assert(row.role === 'CLIENT', 'Database role is CLIENT');
  assert(row.phone_number === '+234 803 123 4567', 'Database phone_number is formatted properly');

  // Clean test records
  await db.query(`DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_email LIKE '%@mvplaunch.test')`);
  await db.query(`DELETE FROM orders WHERE customer_email LIKE '%@mvplaunch.test'`);
  await db.query(`DELETE FROM users WHERE email LIKE '%@mvplaunch.test'`);

  console.log('\n======================================================');
  console.log('🎉 ALL 12 VERIFICATION TEST SUITES PASSED FLAWLESSLY!');
  console.log('======================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE RUNNER ERROR:', err);
  process.exit(1);
});
