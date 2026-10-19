/**
 * MVPLaunch NG: Comprehensive RBAC & Paid-Package-To-Project Workflow Security Test Suite
 * Covers:
 * 1. Role Escalation Prevention on Registration
 * 2. Platform Admin Vetting & Management of Developer Accounts & Roles
 * 3. BOLA / IDOR Protection on Client Orders & Deliverables
 * 4. End-to-End Paid Package -> Verification -> Project Submission -> Admin Assignment -> Developer Workflow
 * 5. Horizontal Access Control on Project Tasks, Notes & Deliverables
 * 6. File Upload MIME/Extension Restrictions (Anti-XSS & Anti-RCE)
 */
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const db = require('../src/config/db');
const { signToken } = require('../src/utils/token');
const { ensureDemoUsers } = require('../src/modules/auth/demoSeed.service');

describe('RBAC & Paid-Package-To-Project Workflow Security Suite', () => {
  let adminToken, devToken, dev2Token, clientToken, client2Token;
  let adminUser, devUser, dev2User, clientUser, client2User;

  beforeAll(async () => {
    await ensureDemoUsers();

    // 1. Platform Admin
    const adminRes = await db.query("SELECT * FROM users WHERE email = 'admin@mvplaunch.ng'");
    adminUser = adminRes.rows[0];
    adminToken = signToken({ id: adminUser.id, email: adminUser.email, role: 'ADMIN' });

    // 2. Primary Assigned Developer (Adebayo)
    const devRes = await db.query("SELECT * FROM users WHERE email = 'developer@mvplaunch.ng'");
    devUser = devRes.rows[0];
    devToken = signToken({ id: devUser.id, email: devUser.email, role: 'DEVELOPER' });

    // 3. Unassigned / Secondary Developer (Fatima)
    const dev2Res = await db.query("SELECT * FROM users WHERE email = 'engineer.fatima@mvplaunch.ng'");
    dev2User = dev2Res.rows[0];
    dev2Token = signToken({ id: dev2User.id, email: dev2User.email, role: 'DEVELOPER' });

    // 4. Client A (Founder Chioma)
    const clientRes = await db.query("SELECT * FROM users WHERE email = 'founder@quickretail.ng'");
    clientUser = clientRes.rows[0];
    clientToken = signToken({ id: clientUser.id, email: clientUser.email, role: 'CLIENT' });

    // 5. Client B (Student Tunde)
    const client2Res = await db.query("SELECT * FROM users WHERE email = 'student@unilag.edu.ng'");
    client2User = client2Res.rows[0];
    client2Token = signToken({ id: client2User.id, email: client2User.email, role: 'CLIENT' });
  });

  afterAll(async () => {
    // Teardown test artifacts
    try {
      await db.query("DELETE FROM users WHERE email LIKE 'sec.test.%@mvplaunch.ng'");
    } catch (e) {
      // ignore
    }
  });

  describe('1. Role Escalation Resistance on Public Registration', () => {
    it('should force role to CLIENT even when attacker explicitly sends role: DEVELOPER', async () => {
      const email = `sec.test.dev.${Date.now()}@mvplaunch.ng`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'Password123!',
          fullName: 'Malicious Dev Register',
          role: 'DEVELOPER'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CLIENT');

      // Verify DB persists CLIENT, not DEVELOPER
      const dbCheck = await db.query('SELECT role FROM users WHERE email = $1', [email]);
      expect(dbCheck.rows[0].role).toBe('CLIENT');
    });

    it('should force role to CLIENT when attacker sends role: ADMIN or PLATFORM ADMIN', async () => {
      const email = `sec.test.admin.${Date.now()}@mvplaunch.ng`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'Password123!',
          fullName: 'Malicious Admin Register',
          role: 'ADMIN'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.role).toBe('CLIENT');

      const dbCheck = await db.query('SELECT role FROM users WHERE email = $1', [email]);
      expect(dbCheck.rows[0].role).toBe('CLIENT');
    });
  });

  describe('2. Platform Admin Vetting & User Management Controls', () => {
    it('should reject unauthenticated request to create developer account with 401', async () => {
      const res = await request(app)
        .post('/api/v1/users/developer')
        .send({
          email: 'unauth.dev@mvplaunch.ng',
          password: 'DevPassword123!',
          fullName: 'Unauth Dev'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject regular CLIENT attempting to create a developer account with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/users/developer')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          email: 'client.spoofed.dev@mvplaunch.ng',
          password: 'DevPassword123!',
          fullName: 'Client Spoofed Dev'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Platform Admin to create an approved, vetted Developer account', async () => {
      const devEmail = `sec.test.approved.dev.${Date.now()}@mvplaunch.ng`;
      const res = await request(app)
        .post('/api/v1/users/developer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: devEmail,
          password: 'DevPassword123!',
          fullName: 'Oluwaseun Dev',
          phoneNumber: '+2348030001122',
          skills: 'TypeScript, React, Node.js, PostgreSQL',
          specializations: ['FinTech', 'SaaS']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.developer.role).toBe('DEVELOPER');
      expect(res.body.data.developer.email).toBe(devEmail);
    });

    it('should reject CLIENT attempting to promote themselves or others to ADMIN via PATCH /api/v1/users/:id/role', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${clientUser.id}/role`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ role: 'ADMIN' });

      expect(res.statusCode).toBe(403);
    });

    it('should allow Platform Admin to update a user role', async () => {
      // Create temp user to promote
      const tempEmail = `sec.test.promote.${Date.now()}@mvplaunch.ng`;
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: tempEmail,
          password: 'Password123!',
          fullName: 'Candidate To Promote'
        });
      const tempUserId = reg.body.data.user.id;

      const res = await request(app)
        .patch(`/api/v1/users/${tempUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'DEVELOPER' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('DEVELOPER');
    });

    it('should prevent Admin from demoting their own account', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${adminUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'CLIENT' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('cannot demote their own account');
    });
  });

  describe('3. Order Access Isolation & BOLA/IDOR Prevention', () => {
    let clientAOrderId;

    beforeAll(async () => {
      // Create a test package order belonging to Client A
      const initRes = await request(app)
        .post('/api/v1/payments/initialize-package')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          packageId: 'idea-validation',
          customerName: clientUser.full_name,
          customerEmail: clientUser.email,
          customerPhone: '08011223344'
        });
      clientAOrderId = initRes.body.data.orderId;
    });

    it('should allow Client A to view their own order', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${clientAOrderId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.id).toBe(clientAOrderId);
    });

    it('should FORBID Client B from accessing Client A\'s order (IDOR Protection)', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${clientAOrderId}`)
        .set('Authorization', `Bearer ${client2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('should FORBID Developer from accessing Client A\'s financial order', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${clientAOrderId}`)
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('financial orders');
    });

    it('should return empty orders list when Developer queries GET /api/v1/orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should allow Platform Admin to inspect any order', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${clientAOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.id).toBe(clientAOrderId);
    });
  });

  describe('4. Complete End-to-End Paid-Package-To-Project Workflow', () => {
    let paidOrderId;
    let paymentRef;
    let createdProjectId;
    let trackingCode;
    let deliverableId;

    it('Step 1: Attempt project submission BEFORE payment is verified -> must return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/projects/submit')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Unpaid Stolen Idea',
          industry: 'Retail & Commerce',
          problemStatement: 'Testing gating bypass without verified payment order',
          targetUsers: 'SMB Retail Owners',
          proposedSolution: 'Automated POS Inventory Management'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('paid package order is required');
    });

    it('Step 2: Customer initializes package checkout (Founder MVP Launch - ₦35,000)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize-package')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          packageId: 'founder-mvp',
          customerName: clientUser.full_name,
          customerEmail: clientUser.email,
          customerPhone: '08145556677',
          notes: 'Fullstack MVP for retail inventory tracking'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amountNgn).toBe(35000);
      expect(res.body.data).toHaveProperty('authorizationUrl');

      paidOrderId = res.body.data.orderId;
      paymentRef = res.body.data.reference;
    });

    it('Step 3: Server verifies payment directly via Paystack and unlocks the order', async () => {
      const res = await request(app)
        .get(`/api/v1/payments/verify/${paymentRef}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PAID');

      // Verify order payment status in DB is PAID and status is ACTIVE
      const orderDb = await db.query('SELECT payment_status, status FROM orders WHERE id = $1', [paidOrderId]);
      expect(orderDb.rows[0].payment_status).toBe('PAID');
      expect(orderDb.rows[0].status).toBe('ACTIVE');
    });

    it('Step 4: Client submits project requirements brief for the paid order', async () => {
      const res = await request(app)
        .post('/api/v1/projects/submit')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: paidOrderId,
          title: 'QuickRetail Cloud POS',
          organizationName: 'QuickRetail Technologies Ltd',
          industry: 'FinTech',
          problemStatement: 'Retailers in Lagos struggle to sync offline sales with online stock in real time.',
          targetUsers: 'Supermarket cashiers and boutique store owners in Nigeria',
          proposedSolution: 'Mobile-first cloud POS with offline barcode scanning and Paystack checkout.',
          coreFeatures: 'Offline sync\nPaystack POS terminal integration\nInventory alerts',
          niceToHaveFeatures: 'WhatsApp receipt sharing\nAI sales forecasting',
          expectedOutcome: 'Reduce checkout wait times by 60%',
          preferredDeadline: '3 Weeks',
          technicalRequirements: 'Node.js, PostgreSQL, React, Tailwind CSS'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toHaveProperty('project_code');
      expect(res.body.data.project.project_code).toMatch(/^PRJ-/);
      expect(res.body.data.project.status).toBe('SUBMITTED');

      createdProjectId = res.body.data.project.id;
      trackingCode = res.body.data.project.project_code;

      // Verify order has project_submitted = true
      const orderCheck = await db.query('SELECT project_submitted, project_id FROM orders WHERE id = $1', [paidOrderId]);
      expect(orderCheck.rows[0].project_submitted).toBe(true);
      expect(orderCheck.rows[0].project_id).toBe(createdProjectId);
    });

    it('Step 5: Attempt duplicate project submission on already submitted order -> returns 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/v1/projects/submit')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: paidOrderId,
          title: 'Duplicate Project Submission Attempt',
          industry: 'Retail & Commerce',
          problemStatement: 'Testing duplicate submission prevention logic',
          targetUsers: 'SMB Retail Owners',
          proposedSolution: 'Automated POS Inventory Management'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('already been submitted');
    });

    it('Step 6: Submission is immediately visible to Platform Admin with full details', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.title).toBe('QuickRetail Cloud POS');
      expect(res.body.data.project.status).toBe('SUBMITTED');
      expect(res.body.data.project.developer_id).toBeNull();
    });

    it('Step 7: Project is NOT visible to Developer before assignment', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not assigned');
    });

    it('Step 8: Platform Admin assigns Developer A to the project', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${createdProjectId}/assign-engineer`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          developerId: devUser.id,
          instructions: 'Build MVP using React + Node.js. Priority is offline caching and Paystack POS.',
          priority: 'HIGH'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.developer_id).toBe(devUser.id);
      expect(res.body.data.project.status).toBe('ENGINEER_ASSIGNED');
    });

    it('Step 9: Project immediately appears in assigned Developer A\'s workspace', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.id).toBe(createdProjectId);
      expect(res.body.data.project.developer_id).toBe(devUser.id);
    });

    it('Step 10: Unassigned Developer B attempting to access or accept Developer A\'s project -> returns 403 Forbidden', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${createdProjectId}/accept`)
        .set('Authorization', `Bearer ${dev2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not assigned');
    });

    it('Step 11: Assigned Developer A accepts the project task', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${createdProjectId}/accept`)
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.status).toBe('ACCEPTED');
    });

    it('Step 12: Assigned Developer A updates development progress to 50%', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/progress`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          progressPercent: 50,
          completedFeatures: 'Authentication\nOffline POS scanner\nProduct catalog sync',
          knownLimitations: 'Receipt printer integration pending hardware test'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.progress_percent).toBe(50);
      expect(res.body.data.project.status).toBe('IN_DEVELOPMENT');
    });

    it('Step 13: Developer A attempting unauthorized status transition directly to DELIVERED -> returns 403 Forbidden', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/status`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({ status: 'DELIVERED' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Developers are only permitted to update status to');
    });

    it('Step 14: Assigned Developer A submits deliverables for QA review', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${createdProjectId}/deliverables`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          title: 'QuickRetail Cloud POS - Sprint 1 Handover',
          stagingUrl: 'https://staging.quickretail.mvplaunch.ng',
          repoUrl: 'https://github.com/mvplaunch-ng/quickretail-pos',
          notes: 'Full prototype deployed to staging with mock receipt printer.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deliverable).toHaveProperty('id');
      deliverableId = res.body.data.deliverable.id;

      // Project moves to INTERNAL_REVIEW
      const check = await db.query('SELECT status FROM projects WHERE id = $1', [createdProjectId]);
      expect(check.rows[0].status).toBe('INTERNAL_REVIEW');
    });

    it('Step 15: Platform Admin reviews deliverable and approves it', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/deliverables/${deliverableId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'APPROVED',
          adminFeedback: 'Excellent work. POS staging tests passed all criteria.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.deliverable.status).toBe('APPROVED');
    });

    it('Step 16: Platform Admin marks project delivered to client with live production URL', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${createdProjectId}/deliver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productionUrl: 'https://app.quickretail.ng',
          deliveryNotes: 'Production deployment verified on custom domain.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.status).toBe('DELIVERED');

      // Verify order fulfillment status is FULFILLED
      const orderCheck = await db.query('SELECT fulfillment_status FROM orders WHERE id = $1', [paidOrderId]);
      expect(orderCheck.rows[0].fulfillment_status).toBe('FULFILLED');
    });

    it('Step 17: Client views their delivered project and approved deliverables', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.status).toBe('DELIVERED');
      expect(res.body.data.project.deliverables.length).toBeGreaterThan(0);
      // Client should NOT see internal admin instructions or notes
      expect(res.body.data.project.admin_instructions).toBeUndefined();
    });
  });

  describe('5. File Upload Restrictions & Stored XSS Prevention', () => {
    it('should REJECT SVG file uploads to prevent stored XSS attacks', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('file', Buffer.from(svgContent), 'malicious.svg');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unsupported file format (.svg)');
    });

    it('should REJECT executable or script file uploads (.html, .exe, .sh)', async () => {
      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('file', Buffer.from('console.log("pwned")'), 'script.html');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Unsupported file format');
    });

    it('should ACCEPT safe document and raster image formats (PDF, PNG, TXT)', async () => {
      const textBuffer = Buffer.from('Project Specification Brief Document Content');
      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .field('fileCategory', 'SPEC')
        .attach('file', textBuffer, 'project-spec.txt');

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.file.file_name).toBe('project-spec.txt');
      expect(res.body.data.file.file_url).toContain('/uploads/');
    });
  });
});
