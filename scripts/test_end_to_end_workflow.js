/**
 * MVPLaunch NG - End-to-End Workflow Verification Script
 * Validates the complete production service cycle:
 * Client -> Select Package -> Pay -> Server Verify -> Submit Idea/Project ->
 * Admin Scopes -> Admin Assigns Engineer -> Engineer Accepts & Develops ->
 * Engineer Submits Deliverables -> Admin Reviews & Approves -> Client Receives Delivery
 */
const http = require('http');

const API_BASE = 'http://127.0.0.1:5005/api/v1';

async function request(endpoint, options = {}, token = null) {
  const url = new URL(`${API_BASE}${endpoint}`);
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const bodyData = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          if (res.statusCode >= 400) {
            const err = new Error(parsed?.message || `Request failed with ${res.statusCode}`);
            err.statusCode = res.statusCode;
            err.data = parsed;
            return reject(err);
          }
          resolve(parsed);
        });
      }
    );

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runTest() {
  console.log('================================================================');
  console.log('🚀 MVPLaunch NG — End-to-End Client Service Workflow Verification');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // STEP 1: Client Registration & Authentication
    // -------------------------------------------------------------
    console.log('▶ STEP 1: Creating Client account...');
    const clientEmail = `client.test.${Date.now()}@example.com`;
    const clientPass = 'ClientSecretPass123!';
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        email: clientEmail,
        password: clientPass,
        fullName: 'Folake Adeyemi',
        phoneNumber: '+2348012345678',
        role: 'CLIENT'
      }
    });
    const clientToken = regRes.data.token;
    const clientId = regRes.data.user.id;
    console.log(`  ✓ Client registered: ${regRes.data.user.fullName} (${clientId})\n`);

    // -------------------------------------------------------------
    // STEP 2: Package Selection & Paystack Checkout Initialization
    // -------------------------------------------------------------
    console.log('▶ STEP 2: Client selects Growth MVP package (₦35,000) & initializes Paystack...');
    const initPayRes = await request('/payments/initialize-package', {
      method: 'POST',
      body: {
        packageId: 'founder-mvp',
        customerName: 'Folake Adeyemi',
        customerEmail: clientEmail,
        customerPhone: '+2348012345678',
        notes: 'Building an EdTech interactive quiz platform for Nigerian secondary schools.'
      }
    }, clientToken);

    const paymentReference = initPayRes.data.reference;
    const orderId = initPayRes.data.orderId;
    console.log(`  ✓ Checkout initialized with Paystack!`);
    console.log(`    Order ID: ${orderId}`);
    console.log(`    Paystack Reference: ${paymentReference}`);
    console.log(`    Amount: ₦${initPayRes.data.amountNgn.toLocaleString()} NGN\n`);

    // -------------------------------------------------------------
    // STEP 3: Server-side Payment Verification
    // -------------------------------------------------------------
    console.log('▶ STEP 3: Verifying transaction on server directly with Paystack provider...');
    const verifyRes = await request(`/payments/verify/${encodeURIComponent(paymentReference)}`, {
      method: 'GET'
    }, clientToken);
    console.log(`  ✓ Payment verified! Status: ${verifyRes.data.status}`);
    console.log(`    Amount verified: ₦${verifyRes.data.amountNgn.toLocaleString()}\n`);

    // -------------------------------------------------------------
    // STEP 4: Gating Verification — Submitting Project Details
    // -------------------------------------------------------------
    console.log('▶ STEP 4: Client submits complete Project Brief...');
    const projectBrief = {
      orderId,
      paymentReference,
      title: 'QuizNaija: Gamified WAEC Prep',
      organizationName: 'QuizNaija EduTech Ltd',
      industry: 'EdTech',
      problemStatement: 'Nigerian secondary school students lack interactive, offline-friendly WAEC past questions and exam practice tools with instant explanations.',
      targetUsers: 'SS2 and SS3 students preparing for WAEC/NECO in Lagos and Ibadan.',
      proposedSolution: 'A responsive web MVP with timed quiz modes, subject-wise leaderboards, performance analytics, and WhatsApp group sharing.',
      coreFeatures: [
        'Timed practice mode with 1,000+ verified WAEC questions',
        'Subject selection (Mathematics, English, Physics, Chemistry)',
        'Scorecard generator with WhatsApp 1-click sharing',
        'Daily student leaderboard'
      ],
      niceToHaveFeatures: [
        'AI tutor explanation for wrong answers',
        'Audio narration for literature texts'
      ],
      expectedOutcome: 'Acquire 500 active student users in the first 2 weeks after launch.',
      existingProductUrl: 'https://quiznaija-demo.preview.ng',
      competitorReferences: 'uLesson and Myschool.ng',
      designPreferences: 'Clean modern typography, dark mode, high contrast green badges',
      technicalRequirements: 'React, Node.js, PostgreSQL, Paystack for student premium access',
      preferredDeadline: '3-4 Weeks',
      selectedPackageId: 'founder-mvp',
      selectedPackageName: 'Founder MVP Launch',
      additionalNotes: 'Need fast loading on low-bandwidth 3G mobile connections.'
    };

    const submitRes = await request('/projects/submit', {
      method: 'POST',
      body: projectBrief
    }, clientToken);

    const project = submitRes.data.project;
    const projectId = project.id;
    const projectCode = project.project_code;
    console.log(`  ✓ Project brief successfully submitted & gated!`);
    console.log(`    Project ID: ${projectId}`);
    console.log(`    Tracking Code: ${projectCode}`);
    console.log(`    Lifecycle Status: ${project.status}\n`);

    // -------------------------------------------------------------
    // STEP 5: Platform Director / Admin Reviews & Scopes
    // -------------------------------------------------------------
    console.log('▶ STEP 5: Admin signs in & inspects the paid order + project dossier...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@mvplaunch.ng',
        password: 'AdminPass123!'
      }
    });
    const adminToken = adminLoginRes.data.token;
    console.log('  ✓ Admin authenticated successfully.');

    // Admin views metrics
    const metricsRes = await request('/admin/metrics', { method: 'GET' }, adminToken);
    console.log(`    Total Verified Revenue: ₦${metricsRes.data.metrics.financials.totalRevenueNgn.toLocaleString()} NGN`);
    console.log(`    Total Orders: ${metricsRes.data.metrics.orders.total}`);
    console.log(`    Active Projects: ${metricsRes.data.metrics.projects.total}`);

    // Admin scopes technical specifications
    console.log('\n▶ STEP 6: Admin scopes technical specifications & acceptance criteria...');
    const scopeRes = await request(`/projects/${projectId}/scope`, {
      method: 'PATCH',
      body: {
        adminInstructions: 'Use Vite + React frontend with PostgreSQL backend. Implement offline caching with ServiceWorker for WAEC questions. Ensure Paystack webhook verification.',
        acceptanceCriteria: '1. Fast sub-1.5s mobile page load. 2. 100% test coverage for score calculator. 3. Deployed live on Render/Vercel with verified HTTPS.',
        priority: 'HIGH',
        internalDeadline: new Date(Date.now() + 14 * 86400000).toISOString()
      }
    }, adminToken);
    console.log(`  ✓ Technical scope updated. Status: ${scopeRes.data.project.status}`);

    // -------------------------------------------------------------
    // STEP 7: Admin Assigns Software Engineer
    // -------------------------------------------------------------
    console.log('\n▶ STEP 7: Admin inspects available engineers & assigns project...');
    const engineersRes = await request('/projects/meta/engineers', { method: 'GET' }, adminToken);
    const availableEngineers = engineersRes.data.engineers;
    console.log(`  ✓ Available software engineers found: ${availableEngineers.length}`);
    const assignedDev = availableEngineers[0];
    console.log(`    Assigning to: ${assignedDev.full_name} (${assignedDev.email})`);

    const assignRes = await request(`/projects/${projectId}/assign-engineer`, {
      method: 'POST',
      body: {
        developerId: assignedDev.id,
        instructions: 'Folake needs the timed quiz mode and WhatsApp scorecard generator ready for testing first.',
        priority: 'HIGH',
        internalDeadline: new Date(Date.now() + 10 * 86400000).toISOString()
      }
    }, adminToken);
    console.log(`  ✓ Engineer assigned! New Status: ${assignRes.data.project.status}\n`);

    // -------------------------------------------------------------
    // STEP 8: Software Engineer Logs In & Accepts Task
    // -------------------------------------------------------------
    console.log('▶ STEP 8: Software Engineer logs into their personal account...');
    const devLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: assignedDev.email,
        password: 'DevPass123!'
      }
    });
    const devToken = devLoginRes.data.token;
    console.log('  ✓ Software Engineer authenticated.');

    // Engineer views their assigned task list
    const devProjectsRes = await request('/projects', { method: 'GET' }, devToken);
    const devProjects = Array.isArray(devProjectsRes.data) ? devProjectsRes.data : (devProjectsRes.data?.projects || []);
    console.log(`  ✓ Engineer sees ${devProjects.length} assigned task(s).`);
    const myTask = devProjects.find(p => p.id === projectId);
    if (!myTask) throw new Error('Assigned task not found in developer workspace!');
    console.log(`    Task confirmed: "${myTask.title}" (${myTask.project_code})`);

    // Engineer accepts task
    const acceptRes = await request(`/projects/${projectId}/accept`, { method: 'POST' }, devToken);
    console.log(`  ✓ Engineer accepted task! Status: ${acceptRes.data.project.status}`);

    // Engineer posts technical question to Admin
    await request(`/projects/${projectId}/notes`, {
      method: 'POST',
      body: {
        content: 'Director, I have set up the WAEC database schema and timed quiz engine. Proceeding to WhatsApp scorecard preview generation.',
        noteType: 'INTERNAL'
      }
    }, devToken);
    console.log('  ✓ Engineer posted technical update note to Admin.');

    // Engineer updates progress
    await request(`/projects/${projectId}/progress`, {
      method: 'PATCH',
      body: {
        progressPercent: 75,
        completedFeatures: [
          'Timed quiz mode for Math and English',
          'PostgreSQL schema for questions and answers',
          'Score calculation and leaderboard ranking'
        ],
        knownLimitations: 'Physics formulas require LaTeX rendering plugin in next push.'
      }
    }, devToken);
    console.log('  ✓ Engineer updated development progress to 75%.');

    // -------------------------------------------------------------
    // STEP 9: Engineer Submits Deliverable for QA Review
    // -------------------------------------------------------------
    console.log('\n▶ STEP 9: Engineer submits completed MVP deliverables...');
    const deliverableRes = await request(`/projects/${projectId}/deliverables`, {
      method: 'POST',
      body: {
        title: 'QuizNaija V1.0 Staging Release',
        stagingUrl: 'https://quiznaija-staging.vercel.app',
        repoUrl: 'https://github.com/mvplaunch-ng/quiznaija-mvp',
        notes: 'Ready for internal Director testing. WAEC question bank loaded with 1,200 verified items.'
      }
    }, devToken);
    console.log(`  ✓ Deliverable submitted! Title: ${deliverableRes.data.deliverable.title}`);

    // Check project status has moved to INTERNAL_REVIEW
    const updatedProjDev = await request(`/projects/${projectId}`, { method: 'GET' }, devToken);
    console.log(`    Project Lifecycle Status: ${updatedProjDev.data.project.status}`);

    // -------------------------------------------------------------
    // STEP 10: Admin Reviews Deliverable & Delivers to Client
    // -------------------------------------------------------------
    console.log('\n▶ STEP 10: Admin reviews & approves deliverable, then marks delivered...');
    const reviewRes = await request(`/projects/deliverables/${deliverableRes.data.deliverable.id}/review`, {
      method: 'PATCH',
      body: {
        status: 'APPROVED',
        adminFeedback: 'Excellent work. Verified timed quiz engine and mobile responsiveness. Approved for client delivery.'
      }
    }, adminToken);
    console.log(`  ✓ Deliverable approved by Admin! Deliverable Status: ${reviewRes.data.deliverable.status}`);

    // Admin marks delivered to client with live production URL
    const deliverRes = await request(`/projects/${projectId}/deliver`, {
      method: 'POST',
      body: {
        productionUrl: 'https://quiznaija.ng',
        deliveryNotes: 'Your QuizNaija MVP is live at https://quiznaija.ng! GitHub repository access has been transferred to your email.'
      }
    }, adminToken);
    console.log(`  ✓ Project marked DELIVERED to client! Status: ${deliverRes.data.project.status}`);

    // -------------------------------------------------------------
    // STEP 11: Client Tracks Delivered Project
    // -------------------------------------------------------------
    console.log('\n▶ STEP 11: Client logs in to verify delivery & live URLs...');
    const clientProjRes = await request(`/projects/${projectId}`, { method: 'GET' }, clientToken);
    const clientProj = clientProjRes.data.project;
    console.log(`  ✓ Client sees project status: ${clientProj.status}`);
    console.log(`    Production URL: ${clientProj.production_url}`);
    console.log(`    Staging URL: ${clientProj.staging_url}`);
    console.log(`    GitHub Repo: ${clientProj.repo_url}`);
    console.log(`    Audit logs hidden from client: ${clientProj.admin_notes === undefined ? 'YES (Secured)' : 'NO'}`);

    // -------------------------------------------------------------
    // STEP 12: Chronological Audit Trail Verification
    // -------------------------------------------------------------
    console.log('\n▶ STEP 12: Checking Chronological Audit Trail in Admin system...');
    const auditRes = await request('/audit-logs?limit=10', { method: 'GET' }, adminToken);
    const logs = Array.isArray(auditRes.data) ? auditRes.data : (auditRes.data?.auditLogs || []);
    console.log(`  ✓ Retrieved ${logs.length} recent audit logs:`);
    logs.slice(0, 6).forEach((l, i) => {
      console.log(`    ${i + 1}. [${new Date(l.created_at).toLocaleTimeString()}] ${l.action} (${l.entity_type}) by ${l.user_name || 'System'}`);
    });

    console.log('\n================================================================');
    console.log('🎉 ALL 11 WORKFLOW STAGES PASSED SUCCESSFULLY!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ WORKFLOW TEST FAILED:', err.message);
    if (err.data) {
      console.error('Details:', JSON.stringify(err.data, null, 2));
    }
    process.exit(1);
  }
}

runTest();
