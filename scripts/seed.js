/**
 * MVPLaunch NG - Database Seeder
 * Populates PostgreSQL database with realistic Nigerian MVP launch workflow data.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'mvplaunch_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
);

async function seedDatabase() {
  const client = await pool.connect();
  console.log('[Seeder] Connected to PostgreSQL.');

  try {
    await client.query('BEGIN');

    console.log('[Seeder] Cleaning existing tables...');
    await client.query(`
      TRUNCATE TABLE 
        audit_logs, notifications, reviews, maintenance_subscriptions,
        user_validations, handovers, deployments, payments, messages,
        files, tasks, milestones, orders, proposals, projects,
        mvp_scopes, customer_definitions, problem_clarifications,
        ideas, user_sessions, users
      CASCADE;
    `);

    console.log('[Seeder] Creating users...');
    const adminPass = await bcrypt.hash('AdminPass123!', 10);
    const devPass = await bcrypt.hash('DevPass123!', 10);
    const clientPass = await bcrypt.hash('ClientPass123!', 10);

    const adminUser = await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_verified, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = true
       RETURNING id`,
      ['admin@mvplaunch.ng', adminPass, 'Emeka Okonkwo', '+2348031234567', 'ADMIN', true, true, 'Lead Architect & MVPLaunch Director']
    );
    const adminId = adminUser.rows[0].id;

    const devUser = await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_verified, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = true
       RETURNING id`,
      ['developer@mvplaunch.ng', devPass, 'Adebayo Olufemi', '+2348029876543', 'DEVELOPER', true, true, 'Senior Full-Stack MVP Engineer (Node.js & React)']
    );
    const devId = devUser.rows[0].id;

    const clientUser1 = await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_verified, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = true
       RETURNING id`,
      ['founder@quickretail.ng', clientPass, 'Chioma Adeleke', '+2348145556677', 'CLIENT', true, true, 'Founder of QuickRetail Nigeria']
    );
    const clientId1 = clientUser1.rows[0].id;

    const clientUser2 = await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_verified, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = true
       RETURNING id`,
      ['student@unilag.edu.ng', clientPass, 'Tunde Bakare', '+2348123334455', 'CLIENT', true, true, 'UNILAG Final Year Tech Entrepreneur']
    );
    const clientId2 = clientUser2.rows[0].id;

    console.log('[Seeder] Creating client ideas...');
    const idea1 = await client.query(
      `INSERT INTO ideas (client_id, title, raw_summary, target_industry, budget_bracket, target_timeline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        clientId1,
        'QuickRetail NG',
        'A micro-inventory and WhatsApp commerce storefront engine for Alaba and Computer Village traders in Lagos.',
        'E-commerce & Retail',
        '₦500,000 - ₦1,000,000',
        '3-4 Weeks',
        'PROPOSAL_GENERATED'
      ]
    );
    const ideaId1 = idea1.rows[0].id;

    const idea2 = await client.query(
      `INSERT INTO ideas (client_id, title, raw_summary, target_industry, budget_bracket, target_timeline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        clientId2,
        'CampusBite UNILAG',
        'Hostel room-to-room delivery and meal subscription app for Akoka students during exams.',
        'Food & Logistics',
        '₦300,000 - ₦500,000',
        '2-3 Weeks',
        'SUBMITTED'
      ]
    );

    console.log('[Seeder] Clarifying problem & defining customer...');
    await client.query(
      `INSERT INTO problem_clarifications 
        (idea_id, core_problem, alternative_solutions, unique_value_prop, why_now, monetization_hypothesis, status, reviewed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        ideaId1,
        'Traders lose up to 40% of sales because their WhatsApp status catalog requires manual back-and-forth price checking and manual account transfers.',
        'Shopify (too complex/expensive for Naira billing), Instagram DMs (unorganized order tracking).',
        'Instant 30-second mobile storefront with automated Paystack checkout and instant WhatsApp order dispatch.',
        'Cashless economy push in Nigeria and widespread WhatsApp Business adoption in commercial hubs.',
        '1.5% fee per transaction capped at ₦1,000 or flat monthly subscription of ₦4,500.',
        'VALIDATED',
        adminId
      ]
    );

    await client.query(
      `INSERT INTO customer_definitions 
        (idea_id, primary_persona, pain_points, distribution_channel, user_archetype, location_context)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        ideaId1,
        'Retail traders & gadget vendors selling on WhatsApp & Instagram',
        'Managing stock manually, confirming bank transfer alerts manually, dealing with unconfirmed payment receipts.',
        'WhatsApp direct outreach, trade associations at Computer Village Ikeja.',
        'Tech-savvy Nigerian merchant aged 22-38 with high WhatsApp usage.',
        'Lagos (Ikeja, Trade Fair, Alaba)'
      ]
    );

    console.log('[Seeder] Defining MVP scope...');
    await client.query(
      `INSERT INTO mvp_scopes 
        (idea_id, must_have_features, out_of_scope_features, tech_stack_preferences, target_launch_date, complexity_rating, estimated_weeks, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        ideaId1,
        JSON.stringify([
          'Mobile-first customer product catalog',
          'Paystack direct checkout integration (Cards, USSD, Bank Transfer)',
          'Merchant admin inventory update page',
          'Automated WhatsApp order confirmation message link'
        ]),
        JSON.stringify([
          'Multi-currency foreign cards',
          'Native iOS/Android App (PWA only for MVP)',
          'Automated delivery dispatch riders integration'
        ]),
        JSON.stringify(['React.js', 'Express.js', 'PostgreSQL', 'Paystack API']),
        '2026-10-31',
        'MEDIUM',
        3,
        'FROZEN'
      ]
    );

    console.log('[Seeder] Creating project, proposal, and order...');
    const project = await client.query(
      `INSERT INTO projects 
        (idea_id, client_id, developer_id, title, slug, description, status, repo_url, staging_url, start_date, target_delivery_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        ideaId1,
        clientId1,
        devId,
        'QuickRetail NG - WhatsApp Commerce MVP',
        'quickretail-ng-whatsapp-commerce-mvp',
        'Production web MVP for Nigerian merchants with Paystack integration and WhatsApp order processing.',
        'IN_DEVELOPMENT',
        'https://github.com/mvplaunch-ng/quickretail-mvp',
        'https://staging-quickretail.mvplaunch.ng',
        '2026-09-15',
        '2026-10-06'
      ]
    );
    const projectId = project.rows[0].id;

    const proposal = await client.query(
      `INSERT INTO proposals 
        (project_id, developer_id, title, price_ngn, duration_days, deliverables, terms, valid_until, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        projectId,
        devId,
        'Complete 3-Week QuickRetail NG Web MVP Architecture & Launch',
        750000.0,
        21,
        JSON.stringify([
          'PostgreSQL Normalized Schema & Express API Backend',
          'Mobile-first responsive React customer store & Merchant Admin',
          'Paystack automated checkout & webhook verification',
          'Staging & Production deployment on Render + custom domain setup',
          'Complete GitHub repository handover & 14 days post-launch support'
        ]),
        '30% upfront deposit upon contract signing, 40% on milestone 2 delivery, 30% on final handover.',
        '2026-10-15',
        'ACCEPTED'
      ]
    );
    const proposalId = proposal.rows[0].id;

    const order = await client.query(
      `INSERT INTO orders 
        (project_id, proposal_id, client_id, total_amount_ngn, payment_status, contract_signed_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [projectId, proposalId, clientId1, 750000.0, 'PARTIAL', '2026-09-15 10:00:00Z', 'ACTIVE']
    );
    const orderId = order.rows[0].id;

    console.log('[Seeder] Creating milestones & tasks...');
    const m1 = await client.query(
      `INSERT INTO milestones 
        (project_id, title, description, order_index, amount_ngn, status, due_date, submitted_at, approved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        projectId,
        'Database Schema & Paystack Webhook Engine',
        'Database migrations, authentication, store catalog API, and payment verification.',
        1,
        250000.0,
        'APPROVED',
        '2026-09-22',
        '2026-09-21 16:00:00Z',
        '2026-09-22 09:30:00Z'
      ]
    );
    const m1Id = m1.rows[0].id;

    const m2 = await client.query(
      `INSERT INTO milestones 
        (project_id, title, description, order_index, amount_ngn, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        projectId,
        'Merchant Inventory Dashboard & Customer Cart',
        'Merchant dashboard to add products and customer checkout flow.',
        2,
        250000.0,
        'IN_PROGRESS',
        '2026-09-29'
      ]
    );
    const m2Id = m2.rows[0].id;

    const m3 = await client.query(
      `INSERT INTO milestones 
        (project_id, title, description, order_index, amount_ngn, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        projectId,
        'Production Deployment, User Testing & Handover',
        'Render production deployment, live testing with 5 Alaba merchants, GitHub transfer.',
        3,
        250000.0,
        'PENDING',
        '2026-10-06'
      ]
    );
    const m3Id = m3.rows[0].id;

    // Tasks for M1 & M2
    await client.query(
      `INSERT INTO tasks (milestone_id, project_id, title, description, status, priority, assigned_to, completed_at)
       VALUES 
        ($1, $2, 'Setup PostgreSQL schema & database pooling', 'Setup node-postgres pool and tables', 'DONE', 'HIGH', $3, '2026-09-17 14:00:00Z'),
        ($1, $2, 'Implement Paystack webhook signature verification', 'Hmac SHA512 security for Paystack hooks', 'DONE', 'HIGH', $3, '2026-09-20 18:00:00Z'),
        ($4, $2, 'Build Merchant Product Upload UI', 'Allow photo uploads and stock count', 'IN_PROGRESS', 'MEDIUM', $3, NULL),
        ($4, $2, 'Implement WhatsApp order link generator', 'Creates prefilled wa.me links with cart items', 'TODO', 'HIGH', $3, NULL)`,
      [m1Id, projectId, devId, m2Id]
    );

    console.log('[Seeder] Creating payment records...');
    await client.query(
      `INSERT INTO payments 
        (order_id, milestone_id, user_id, amount_ngn, provider, provider_reference, status, channel, paystack_metadata, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        orderId,
        m1Id,
        clientId1,
        250000.0,
        'PAYSTACK',
        'pstk_ref_qr_001_m1_seed',
        'VERIFIED',
        'card',
        JSON.stringify({ bank: 'Guaranty Trust Bank', last4: '4242', authorization_code: 'AUTH_seed123' }),
        '2026-09-15 10:15:00Z'
      ]
    );

    console.log('[Seeder] Creating deployment & handover records...');
    await client.query(
      `INSERT INTO deployments (project_id, environment, deployment_url, commit_hash, status, notes, deployed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        projectId,
        'STAGING',
        'https://staging-quickretail.mvplaunch.ng',
        '9f81a7b',
        'LIVE',
        'Milestone 1 delivered and running on Render with automated staging health check.',
        devId
      ]
    );

    await client.query(
      `INSERT INTO handovers (project_id, github_repo, access_transferred, credentials_transferred, documentation_url, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        projectId,
        'https://github.com/mvplaunch-ng/quickretail-mvp',
        false,
        false,
        'https://docs.mvplaunch.ng/projects/quickretail',
        'PREPARING',
        'Repo setup initialized. Handover will be finalized at Milestone 3 completion.'
      ]
    );

    console.log('[Seeder] Creating user validation and review...');
    await client.query(
      `INSERT INTO user_validations (project_id, testing_phase, total_testers, key_findings, user_feedback, net_promoter_score)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        projectId,
        'Alpha Merchant Testing',
        5,
        'All 5 merchants successfully placed test orders via WhatsApp within 45 seconds without calling support.',
        JSON.stringify([
          { tester: 'Chinedu Electronics', comment: 'Very fast on slow 3G mobile data', rating: 5 },
          { tester: 'Mama T Fashion Store', comment: 'Love the Paystack checkout receipt alert', rating: 5 }
        ]),
        9
      ]
    );

    await client.query(
      `INSERT INTO reviews (project_id, client_id, rating, title, feedback_text, is_featured, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        projectId,
        clientId1,
        5,
        'MVPLaunch NG made my startup real in 3 weeks!',
        'I had pitched this idea for 8 months with slides. In less than 3 weeks with MVPLaunch NG, we had a real working system taking real customer orders in Lagos.',
        true,
        true
      ]
    );

    console.log('[Seeder] Creating notifications & audit logs...');
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, metadata)
       VALUES 
        ($1, 'Welcome to MVPLaunch NG', 'Your account is ready. Begin by submitting your idea to our launch engineers.', 'WELCOME', true, '{}'),
        ($1, 'Milestone 1 Approved', 'Milestone 1 (Database & Paystack Engine) has been completed and verified.', 'MILESTONE', false, $2)`,
      [clientId1, JSON.stringify({ projectId, milestoneId: m1Id })]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details)
       VALUES 
        ($1, 'PROJECT_SEED_INITIALIZED', 'PROJECT', $2, '127.0.0.1', 'MVPLaunch Seeder v1.0', $3),
        ($4, 'MILESTONE_APPROVED', 'MILESTONE', $5, '127.0.0.1', 'MVPLaunch Seeder v1.0', $6)`,
      [
        adminId,
        projectId,
        JSON.stringify({ notes: 'Seeded initial production demo workflow' }),
        clientId1,
        m1Id,
        JSON.stringify({ amount: 250000 })
      ]
    );

    await client.query('COMMIT');
    console.log('[Seeder] Database seeded successfully with full Nigerian MVP launch workflow!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seeder] Error seeding database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[Seeder] Execution failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
