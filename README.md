# MVPLaunch NG - Production Backend API

> **“MVPLaunch NG helps you turn a validated idea into something real that you can show people.”**

MVPLaunch NG is a specialized Nigerian MVP Launch Platform connecting students, aspiring founders, and small businesses with vetted developers to turn validated ideas into production-ready, deployable web MVPs in 2–4 weeks.

---

## 🌟 Architectural Highlights

* **Architecture**: Modular Monolith adhering to Controller-Service-Repository separation of concerns.
* **Core Engine**: Pure Node.js & Express.js with raw parameterized SQL via `pg` connection pooling (No ORM overhead, zero memory bloat).
* **Database**: Fully normalized PostgreSQL 15+ schema with UUID primary keys (`gen_random_uuid()`), foreign keys, performance indexes, and automated `updated_at` triggers.
* **Security & Hardening**:
  * Dual-mode JWT authentication (HTTP-Only Secure Cookies for React/Vite web apps + `Authorization: Bearer <token>` for API clients).
  * Helmet HTTP security headers.
  * Whitelisted CORS with credentials support.
  * Zod request payload schema validation on bodies, query parameters, and routes.
  * Rate-limiting on general API and strict limits on authentication endpoints.
  * Cryptographic HMAC SHA-512 Paystack webhook verification.
  * Full audit logging of all state mutations.
* **Nigerian Fintech Integrations**:
  * Built-in Paystack Payment Provider supporting Cards, Bank Transfer, and USSD (Amounts processed in NGN with Kobo precision).
  * Offline simulated Paystack checkout interface for instantaneous local development.
* **Documentation & Testing**:
  * Interactive Swagger / OpenAPI 3.0 UI mounted at `/api-docs`.
  * Jest & Supertest automated test suite.
  * Pre-configured `api-testing.http` file for VS Code REST Client / IntelliJ.

---

## 📁 Repository Directory Structure

```
MVPLunch NG/
├── .env.example                       # Production & Local environment template
├── .gitignore                          # Git exclusions
├── api-testing.http                   # Full end-to-end HTTP testing file
├── openapi.yaml                       # OpenAPI 3.0 specification
├── package.json                       # Dependencies, scripts, and engine configs
├── README.md                          # Comprehensive documentation
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql     # 21 Normalized PostgreSQL tables
│   │   └── 002_create_indexes_and_triggers.sql # Indexes & auto-update triggers
│   └── seeds/
│       └── 001_seed_demo_data.sql     # Standalone SQL seed file
├── scripts/
│   ├── migrate.js                     # Automated migration runner
│   └── seed.js                        # Node.js seed runner with bcrypt hashing
├── src/
│   ├── app.js                         # Express application setup & middleware
│   ├── server.js                      # HTTP server listener & graceful shutdown
│   ├── routes.js                      # Master API v1 route aggregator
│   ├── config/
│   │   ├── constants.js               # Roles, statuses, default currency
│   │   ├── db.js                      # PostgreSQL pool & transaction helper
│   │   └── env.js                     # Validated environment configuration
│   ├── middleware/
│   │   ├── auditLogger.middleware.js  # Audit log persistence & recorder
│   │   ├── auth.middleware.js         # JWT cookie & Bearer token authenticator
│   │   ├── errorHandler.middleware.js# Centralized error handler & 404 router
│   │   ├── rateLimiter.middleware.js  # Express rate limiters
│   │   ├── role.middleware.js         # Role-based access control (RBAC)
│   │   └── validate.middleware.js     # Zod schema validation middleware
│   ├── providers/
│   │   ├── email/
│   │   │   ├── email.provider.js      # Email provider abstract interface
│   │   │   └── mock.email.provider.js # Mock / SMTP email service
│   │   ├── payment/
│   │   │   ├── payment.provider.js    # Payment provider interface
│   │   │   └── paystack.provider.js   # Paystack API & HMAC webhook processor
│   │   └── storage/
│   │       ├── storage.provider.js    # Storage provider interface
│   │       └── local.storage.provider.js # Multer local disk upload provider
│   ├── utils/
│   │   ├── apiError.js                # Custom operational error class
│   │   ├── apiResponse.js             # Standardized JSON response envelope
│   │   ├── logger.js                  # Structured application logger
│   │   ├── password.js                # Bcrypt password hasher and verifier
│   │   └── token.js                   # JWT signing, cookie setter & extractor
│   └── modules/
│       ├── admin/                     # Platform analytics & KPI dashboard
│       ├── audit/                     # Audit logs viewer & query service
│       ├── auth/                      # Registration, login, logout, me, password
│       ├── deployments/               # Staging & production deployment logs
│       ├── files/                     # Project documents & evidence uploads
│       ├── handover/                  # GitHub repository transfer & signoff
│       ├── ideas/                     # Client idea submissions & reviews
│       ├── maintenance/               # Post-launch retainer subscriptions
│       ├── messages/                  # Client-Developer threaded discussions
│       ├── milestones/                # Project phases & approval workflow
│       ├── notifications/             # In-app notifications & read receipts
│       ├── orders/                    # Contract commitments & order status
│       ├── payments/                  # Paystack checkout, webhook & verify
│       ├── projects/                  # Project lifecycle management
│       ├── proposals/                 # Quotes, deliverables & acceptance
│       ├── reviews/                   # Client 5-star reviews & testimonials
│       ├── scope/                     # Problem, customer & MVP requirements
│       ├── tasks/                     # Milestone tasks & daily progress
│       ├── users/                     # Profiles & user management
│       └── validation/                # User testing reports & NPS tracking
└── tests/
    ├── test-setup.js                  # Jest test environment config
    ├── setup.test.js                  # Test runner sanity suite
    ├── health.test.js                 # Health check & root route tests
    ├── validation.test.js             # Zod input validation tests
    ├── auth.test.js                   # JWT auth, bcrypt & barrier tests
    ├── payments.test.js               # Paystack provider & webhook tests
    └── security.test.js               # Helmet headers & CORS tests
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher (v24.x recommended)
* **PostgreSQL**: v14.0 or higher (Local Postgres, Supabase, Neon, or Docker)

### 2. Installation
```bash
# Clone the repository and navigate to the project directory
git clone <repo-url>
cd "MVPLunch NG"

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your PostgreSQL database credentials or `DATABASE_URL` is set in `.env`:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mvplaunch_db
PORT=5000
JWT_SECRET=super_secret_jwt_key_2026
PAYSTACK_MOCK_MODE=true
```

### 4. Database Migrations & Seeds
Run the automated migration runner to create all 21 normalized tables, indexes, and triggers:
```bash
# Apply SQL migrations
npm run migrate

# Seed realistic Nigerian MVP demo data (Admin, Developer, Clients, Projects)
npm run seed
```

### 5. Running the Application
```bash
# Start in development mode with hot-reloading
npm run dev

# Or start in production mode
npm start
```

* **API Server**: `http://localhost:5000`
* **Interactive Swagger UI**: `http://localhost:5000/api-docs`
* **Health Check**: `http://localhost:5000/api/v1/health`

---

## 🧪 Testing

Execute the automated test suite covering authentication barriers, Zod schema validation, Paystack HMAC webhook signatures, Helmet security headers, and CORS:
```bash
npm test
```

---

## 👥 Seed Accounts for Testing

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@mvplaunch.ng` | `AdminPass123!` | Director & Chief Architect |
| **DEVELOPER** | `developer@mvplaunch.ng` | `DevPass123!` | Senior Full-Stack MVP Engineer |
| **CLIENT 1** | `founder@quickretail.ng` | `ClientPass123!` | Startup Founder (Active Project) |
| **CLIENT 2** | `student@unilag.edu.ng` | `ClientPass123!` | Student Tech Entrepreneur |

---

## 🔄 End-to-End Nigerian MVP Launch Workflow

```
1. Client Registers & Logs In (`/api/v1/auth/register` & `/api/v1/auth/login`)
      ↓
2. Client Submits Raw Idea (`/api/v1/ideas`)
      ↓
3. Client/Developer Clarifies Problem (`/api/v1/scope/problem`)
      ↓
4. Defines Target Customer Persona (`/api/v1/scope/customer`)
      ↓
5. Freezes MVP Scope & Core Features (`/api/v1/scope/mvp`)
      ↓
6. Project Initialized (`/api/v1/projects`)
      ↓
7. Developer Generates Proposal / Quote in NGN (`/api/v1/proposals`)
      ↓
8. Client Accepts Proposal (`/api/v1/proposals/:id/respond`)
   → Automatically generates committed Order & 3 Milestones
      ↓
9. Client Initializes Phase 1 Deposit via Paystack (`/api/v1/payments/initialize`)
      ↓
10. Developer Builds Features & Updates Tasks (`/api/v1/tasks`)
      ↓
11. Developer Submits Milestone for Review (`/api/v1/milestones/:id/submit`)
      ↓
12. Client Approves Milestone (`/api/v1/milestones/:id/approve`)
      ↓
13. Developer Deploys Staging Preview (`/api/v1/deployments`)
      ↓
14. GitHub Handover Package Transferred (`/api/v1/handover`)
      ↓
15. Client & Developer Sign Off on Handover → Project Completed
      ↓
16. Validation Feedback & NPS Collected (`/api/v1/validation`)
      ↓
17. Client Leaves 5-Star Testimonial (`/api/v1/reviews`)
      ↓
18. Client Activates Monthly Maintenance Retainer (`/api/v1/maintenance`)
```

---

## ☁️ Deployment Instructions for Render

Deploying this modular monolith backend on **Render.com** takes less than 5 minutes:

### Step 1: Create a PostgreSQL Database on Render
1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Name: `mvplaunch-db`.
4. Region: Choose `Frankfurt (EU)` or `Oregon (US)`.
5. Click **Create Database**.
6. Copy the **Internal Database URL** (if deploying the web service in the same Render region) or the **External Database URL**.

### Step 2: Create Web Service on Render
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository: `mvplaunch-ng-backend`.
3. Configure the service:
   * **Name**: `mvplaunch-api`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run migrate && npm run seed`
   * **Start Command**: `npm start`
4. In **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `PORT`: `10000` (Render binds to this automatically)
   * `DATABASE_URL`: *(Paste your Render PostgreSQL connection string)*
   * `DB_SSL`: `true`
   * `JWT_SECRET`: *(Generate a secure 64-character random string)*
   * `JWT_COOKIE_NAME`: `mvplaunch_token`
   * `COOKIE_SECURE`: `true`
   * `COOKIE_SAME_SITE`: `none`
   * `FRONTEND_URL`: `https://your-frontend-domain.vercel.app`
   * `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`
   * `PAYSTACK_SECRET_KEY`: `sk_live_...`
   * `PAYSTACK_PUBLIC_KEY`: `pk_live_...`
   * `PAYSTACK_MOCK_MODE`: `false`
5. Click **Create Web Service**.
6. Once deployed, Render will provide a live URL such as `https://mvplaunch-api.onrender.com`.
7. Access `https://mvplaunch-api.onrender.com/api-docs` to view the live OpenAPI Swagger UI!

---

## 🎨 Frontend Application (React 18 + Vite)

The frontend is a bespoke, high-converting Single Page Application located in the `frontend/` directory, custom-designed to address Nigerian university students, aspiring founders, creators, and small businesses.

### 🚀 Frontend Features & Structure

1. **High-Converting Landing Page**:
   - **Hero Section**: Value proposition headline, live metrics ticker, and interactive 5-stage transformation pipeline (`IDEA → SCOPE → BUILD → DEPLOY → VALIDATE`).
   - **Real Nigerian Founder Bottlenecks**: 4 relatable builder challenges (unreliable dev shops, runaway budgets, non-functional Figma prototypes, lack of deployment handover).
   - **Before vs. After Comparison**: Clear contrast between the typical 6-month struggle vs. the 2-week MVPLaunch NG pipeline.
   - **7-Stage Service Roadmap**: Transparent journey from idea intake to maintenance retainers.
   - **Transparent Pricing & Scope Estimator**: Student/Prototype (₦250k), Business MVP (₦600k), Scaled Platform (₦1.4M), plus interactive cost slider.
   - **Tabbed Client Workspace Preview**: Real dashboard preview showing Milestones, Daily Tasks, Live Deployments, and GitHub Handover.
   - **Authentic Reviews**: Live client feedback fetched dynamically from `/api/v1/reviews`.
   - **12 Comprehensive FAQs**: Covering pricing, IP ownership, Paystack escrow, tech stack, and staging links.

2. **Full-Featured Role-Based Dashboards**:
   - **Client Portal**: Project roadmap, proposal review & acceptance, Paystack milestone escrow checkout, daily task monitoring, real-time developer messaging, deployment staging links, GitHub handover verification, and review submission.
   - **Developer Portal**: Assigned client projects, task board status management (`TODO` → `IN_PROGRESS` → `DONE`), milestone submission for client signoff, and live deployment logger.
   - **Admin Portal**: Executive KPI metrics (Total Platform Revenue in ₦, active projects, escrow balances, user stats, system health, and audit trail inspection).

3. **1-Click Demo Quick-Login Switcher**:
   - Floating role switcher bar allows immediate switching between:
     - **Founder Client**: `founder@quickretail.ng`
     - **Student Founder**: `student@unilag.edu.ng`
     - **Lead Developer**: `developer@mvplaunch.ng`
     - **Platform Admin**: `admin@mvplaunch.ng`

### 💻 Running the Frontend Locally

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server (proxies /api to http://localhost:5005)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

To create an optimized production bundle:
```bash
cd frontend
npm run build
```

---

## 🛡️ Production Security Checklist

- [x] **Password Protection**: Passwords salted and hashed with bcrypt (`SALT_ROUNDS = 10`).
- [x] **Secure Cookies**: JWT transmitted via `httpOnly`, `secure`, and `sameSite` cookies to prevent XSS exfiltration.
- [x] **Bearer Token Fallback**: Supports mobile applications and headless clients via `Authorization: Bearer <token>`.
- [x] **Role-Based Access Control**: Strict middleware enforcement for `CLIENT`, `DEVELOPER`, and `ADMIN`.
- [x] **SQL Injection Defense**: 100% parameterized queries using `node-postgres` (`$1, $2, ...`). Zero string-interpolated SQL.
- [x] **Input Sanitization & Validation**: Zod schema validation rejects unexpected or malformed payload structures before reaching business controllers.
- [x] **Rate Limiting**: Configured with `express-rate-limit` to prevent brute-force attacks on `/auth` routes and API abuse.
- [x] **Secure Headers**: Hardened with Helmet (`x-dns-prefetch-control`, `x-frame-options`, `x-content-type-options`).
- [x] **CORS Whitelist**: Explicitly configured for frontend origins with credential handling.
- [x] **Fintech Webhook Verification**: Cryptographic HMAC SHA-512 verification on Paystack webhooks to prevent spoofed payments.
- [x] **Audit Trail**: Immutable `audit_logs` table tracking user actions, entity mutations, IP addresses, and timestamps.
- [x] **Centralized Error Handling**: Safe error masking in production prevents internal database traces and file paths from leaking to users.

