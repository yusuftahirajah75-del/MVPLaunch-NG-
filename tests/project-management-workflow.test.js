/**
 * MVPLaunch NG: Simplified Client Submission & Project Management Workflow Test Suite
 * Tests:
 * 1. Simplified Client Brief Submission (plain-language fields, auto-populated order, contact details)
 * 2. Payment verification gating (unpaid orders rejected)
 * 3. Cross-client submission prevention (anti-BOLA)
 * 4. Duplicate submission prevention for the same order
 * 5. Admin "View Project Details" (retrieval of full submitted brief and metadata)
 * 6. Admin Developer Assignment workflow (assigning developer with instructions and deadlines)
 * 7. Developer dashboard visibility and anti-IDOR checks (unassigned developers rejected)
 * 8. Developer Accept Assignment workflow (status -> ACCEPTED)
 * 9. Developer Start Development & Progress Update workflow (status -> IN_DEVELOPMENT)
 * 10. Developer Decline Assignment workflow (project returns to SUBMITTED with decline_reason logged)
 * 11. Role-based unauthorized access rejection across all workflow endpoints
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const { signToken } = require('../src/utils/token');
const { ensureDemoUsers } = require('../src/modules/auth/demoSeed.service');

describe('Simplified MVP Submission & Project Management Workflow Suite', () => {
  let adminToken, devToken, dev2Token, clientToken, client2Token;
  let adminUser, devUser, dev2User, clientUser, client2User;
  let paidOrder, unpaidOrder, otherClientPaidOrder;
  let createdProjectId;

  beforeAll(async () => {
    await ensureDemoUsers();

    // 1. Fetch Users
    const adminRes = await db.query("SELECT * FROM users WHERE email = 'admin@mvplaunch.ng'");
    adminUser = adminRes.rows[0];
    adminToken = signToken({ id: adminUser.id, email: adminUser.email, role: 'ADMIN' });

    const devRes = await db.query("SELECT * FROM users WHERE email = 'developer@mvplaunch.ng'");
    devUser = devRes.rows[0];
    devToken = signToken({ id: devUser.id, email: devUser.email, role: 'DEVELOPER' });

    const dev2Res = await db.query("SELECT * FROM users WHERE email = 'engineer.fatima@mvplaunch.ng'");
    dev2User = dev2Res.rows[0];
    dev2Token = signToken({ id: dev2User.id, email: dev2User.email, role: 'DEVELOPER' });

    const clientRes = await db.query("SELECT * FROM users WHERE email = 'founder@quickretail.ng'");
    clientUser = clientRes.rows[0];
    clientToken = signToken({ id: clientUser.id, email: clientUser.email, role: 'CLIENT' });

    const client2Res = await db.query("SELECT * FROM users WHERE email = 'student@unilag.edu.ng'");
    client2User = client2Res.rows[0];
    client2Token = signToken({ id: client2User.id, email: client2User.email, role: 'CLIENT' });

    // 2. Setup Test Orders
    // A. Paid Order for Client 1
    const order1Res = await db.query(
      `INSERT INTO orders (client_id, package_id, package_name, total_amount_ngn, payment_status, project_submitted)
       VALUES ($1, 'founder-mvp', 'Growth MVP (Founder)', 750000, 'PAID', FALSE)
       RETURNING *`,
      [clientUser.id]
    );
    paidOrder = order1Res.rows[0];

    // B. Unpaid Order for Client 1
    const order2Res = await db.query(
      `INSERT INTO orders (client_id, package_id, package_name, total_amount_ngn, payment_status, project_submitted)
       VALUES ($1, 'student-project', 'Starter MVP (Student)', 180000, 'PENDING', FALSE)
       RETURNING *`,
      [clientUser.id]
    );
    unpaidOrder = order2Res.rows[0];

    // C. Paid Order for Client 2 (for cross-client test)
    const order3Res = await db.query(
      `INSERT INTO orders (client_id, package_id, package_name, total_amount_ngn, payment_status, project_submitted)
       VALUES ($1, 'business-digital', 'Advanced MVP (Business)', 1500000, 'PAID', FALSE)
       RETURNING *`,
      [client2User.id]
    );
    otherClientPaidOrder = order3Res.rows[0];
  });

  afterAll(async () => {
    try {
      if (createdProjectId) {
        await db.query('DELETE FROM project_notes WHERE project_id = $1', [createdProjectId]);
        await db.query('DELETE FROM projects WHERE id = $1', [createdProjectId]);
      }
      if (paidOrder) await db.query('DELETE FROM orders WHERE id = $1', [paidOrder.id]);
      if (unpaidOrder) await db.query('DELETE FROM orders WHERE id = $1', [unpaidOrder.id]);
      if (otherClientPaidOrder) await db.query('DELETE FROM orders WHERE id = $1', [otherClientPaidOrder.id]);
    } catch (e) {
      // ignore
    }
  });

  describe('1. Simplified Client Brief Submission & Gating', () => {
    it('should reject submission for an unpaid or pending order', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: unpaidOrder.id,
          title: 'Unpaid Project Attempt',
          industry: 'Fintech',
          problemStatement: 'Unpaid test problem',
          targetUsers: 'Nigerian merchants',
          proposedSolution: 'Mobile solution',
          coreFeatures: 'Wallet checkout'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/payment must be verified|paid package order is required/i);
    });

    it('should prevent client A from submitting for client B paid order (Anti-BOLA/IDOR)', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: otherClientPaidOrder.id,
          title: 'Cross-Client Spoof Attempt',
          industry: 'Logistics',
          problemStatement: 'Trying to steal someone else order',
          targetUsers: 'Hackers',
          proposedSolution: 'Spoofed brief',
          coreFeatures: 'Fake feature'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only submit project details for your own/i);
    });

    it('should successfully submit simplified brief for an eligible paid order', async () => {
      const briefData = {
        orderId: paidOrder.id,
        title: 'AgroTrack Nigeria',
        industry: 'Agritech',
        problemStatement: 'Smallholder tomato farmers in Kano lose up to 45% post-harvest due to fragmented retail distribution.',
        targetUsers: 'Kano farmers, logistics cooperatives, and Lagos fresh produce buyers',
        proposedSolution: 'A simple mobile web dispatch and inventory verification platform with Paystack escrow.',
        coreFeatures: [
          'Farmer harvest listing with photo upload',
          'Temperature-controlled transit truck dispatch',
          'Instant Paystack settlement upon delivery confirmation'
        ],
        clientContactName: 'Chioma Okonkwo',
        clientContactEmail: 'founder@quickretail.ng',
        clientContactPhone: '+2348039876543',
        technicalRequirements: 'Next.js frontend, Node.js API, PostgreSQL database'
      };

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(briefData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toBeDefined();

      const project = res.body.data.project;
      createdProjectId = project.id;

      expect(project.title).toBe('AgroTrack Nigeria');
      expect(project.industry).toBe('Agritech');
      expect(project.status).toBe('SUBMITTED');
      expect(project.project_code).toMatch(/^PRJ-\d{4}-[A-F0-9]{4}$/);
      expect(project.client_contact_name).toBe('Chioma Okonkwo');
      expect(project.client_contact_email).toBe('founder@quickretail.ng');
      expect(project.client_contact_phone).toBe('+2348039876543');

      // Verify DB order is marked as submitted
      const orderCheck = await db.query('SELECT project_submitted, project_id FROM orders WHERE id = $1', [paidOrder.id]);
      expect(orderCheck.rows[0].project_submitted).toBe(true);
      expect(orderCheck.rows[0].project_id).toBe(project.id);
    });

    it('should prevent duplicate submission for the same paid order', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: paidOrder.id,
          title: 'Duplicate AgroTrack Submission',
          industry: 'Agritech',
          problemStatement: 'Duplicate attempt to submit project for already submitted order',
          targetUsers: 'Farmers and wholesale buyers',
          proposedSolution: 'A duplicate mobile dispatch solution attempt',
          coreFeatures: 'Feature 1'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been submitted for this order/i);
    });
  });

  describe('2. Admin "View Project Details" Feature', () => {
    it('should allow authorized Admin to retrieve full submitted project brief and client details', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const proj = res.body.data.project;
      expect(proj.id).toBe(createdProjectId);
      expect(proj.project_code).toMatch(/^PRJ-/);
      expect(proj.client_contact_name).toBe('Chioma Okonkwo');
      expect(proj.problem_statement).toContain('Smallholder tomato farmers');
      expect(proj.target_users).toContain('Kano farmers');
      expect(proj.proposed_solution).toContain('mobile web dispatch');
      expect(proj.industry).toBe('Agritech');
      expect(proj.package_name || proj.selected_package_name).toBe('Growth MVP (Founder)');
      expect(proj.status).toBe('SUBMITTED');
    });

    it('should allow submitting client to view their own project details', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.title).toBe('AgroTrack Nigeria');
    });

    it('should reject another client attempting to view this project (Anti-IDOR)', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${client2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/permission to view this project/i);
    });
  });

  describe('3. Developer Assignment Workflow', () => {
    it('should reject unauthorized client attempting to assign a developer', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/assign`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          developerId: devUser.id,
          instructions: 'Malicious assignment attempt'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should allow Admin to assign a registered developer to the project', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          developerId: devUser.id,
          instructions: 'Implement AgroTrack MVP focusing on farmer mobile responsive UI and Paystack escrow mock.',
          priority: 'HIGH',
          internalDeadline: '2026-11-15'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = res.body.data.project;
      expect(updated.developer_id).toBe(devUser.id);
      expect(updated.status).toBe('ENGINEER_ASSIGNED');
      expect(updated.priority).toBe('HIGH');
      expect(updated.assigned_at).toBeDefined();

      // Verify database persistence
      const dbCheck = await db.query('SELECT developer_id, status, assigned_at FROM projects WHERE id = $1', [createdProjectId]);
      expect(dbCheck.rows[0].developer_id).toBe(devUser.id);
      expect(dbCheck.rows[0].status).toBe('ENGINEER_ASSIGNED');
      expect(dbCheck.rows[0].assigned_at).not.toBeNull();
    });

    it('should make assignment visible in assigned developer task list', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const devProjects = Array.isArray(res.body.data) ? res.body.data : (res.body.data?.projects || []);
      const found = devProjects.find(p => p.id === createdProjectId);
      expect(found).toBeDefined();
      expect(found.title).toBe('AgroTrack Nigeria');
      expect(found.status).toBe('ENGINEER_ASSIGNED');
    });

    it('should prevent unassigned developer (Fatima) from viewing or modifying this project (Anti-IDOR)', async () => {
      const viewRes = await request(app)
        .get(`/api/v1/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${dev2Token}`);

      expect(viewRes.statusCode).toBe(403);
      expect(viewRes.body.message).toMatch(/not assigned to this project/i);

      const acceptRes = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/accept`)
        .set('Authorization', `Bearer ${dev2Token}`);

      expect(acceptRes.statusCode).toBe(403);
    });

    it('should allow assigned developer to accept the assignment', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/accept`)
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.status).toBe('ACCEPTED');

      const dbCheck = await db.query('SELECT status FROM projects WHERE id = $1', [createdProjectId]);
      expect(dbCheck.rows[0].status).toBe('ACCEPTED');
    });

    it('should allow assigned developer to start development and update progress', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${createdProjectId}/progress`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          status: 'IN_DEVELOPMENT',
          progressPercent: 35,
          completedFeatures: 'Scaffolded Next.js layout\nIntegrated Paystack test keys',
          knownLimitations: 'Awaiting truck dispatch API specs'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = res.body.data.project;
      expect(updated.status).toBe('IN_DEVELOPMENT');
      expect(updated.progress_percent).toBe(35);
    });
  });

  describe('4. Developer Decline Assignment Workflow', () => {
    let secondProject;

    beforeAll(async () => {
      // Create a second project for testing the decline workflow
      const res = await db.query(
        `INSERT INTO projects (
           client_id, project_code, title, slug, industry, problem_statement,
           target_users, proposed_solution, status, developer_id
         )
         VALUES ($1, 'PRJ-8821-DECL', 'MedFast Delivery', 'medfast-delivery', 'Healthtech',
                 'Medicine delivery delays in Ibadan', 'Pharmacies', 'On-demand rider app',
                 'ENGINEER_ASSIGNED', $2)
         RETURNING *`,
        [client2User.id, dev2User.id]
      );
      secondProject = res.rows[0];
    });

    afterAll(async () => {
      if (secondProject) {
        await db.query('DELETE FROM projects WHERE id = $1', [secondProject.id]);
      }
    });

    it('should prevent an unassigned developer from declining another developer assignment', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${secondProject.id}/decline`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({ reason: 'Malicious decline attempt' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/not assigned to this project/i);
    });

    it('should allow assigned developer (Fatima) to decline assignment with a recorded reason', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${secondProject.id}/decline`)
        .set('Authorization', `Bearer ${dev2Token}`)
        .send({ reason: 'Current workload capacity reached; sprint fully allocated.' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const declined = res.body.data.project;
      expect(declined.developer_id).toBeNull();
      expect(declined.status).toBe('SUBMITTED');
      expect(declined.decline_reason).toBe('Current workload capacity reached; sprint fully allocated.');
      expect(declined.declined_at).toBeDefined();

      // Verify in database
      const dbCheck = await db.query('SELECT developer_id, status, decline_reason, declined_at FROM projects WHERE id = $1', [secondProject.id]);
      expect(dbCheck.rows[0].developer_id).toBeNull();
      expect(dbCheck.rows[0].status).toBe('SUBMITTED');
      expect(dbCheck.rows[0].decline_reason).toBe('Current workload capacity reached; sprint fully allocated.');
      expect(dbCheck.rows[0].declined_at).not.toBeNull();
    });

    it('should reflect declined project back in Admin dashboard projects list as SUBMITTED', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${secondProject.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.project.status).toBe('SUBMITTED');
      expect(res.body.data.project.developer_id).toBeNull();
      expect(res.body.data.project.decline_reason).toBe('Current workload capacity reached; sprint fully allocated.');
    });
  });
});
