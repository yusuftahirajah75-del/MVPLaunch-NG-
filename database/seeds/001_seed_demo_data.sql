-- MVPLaunch NG: Standalone SQL Seed File
-- Seed: 001_seed_demo_data.sql
-- Default passwords are encrypted with bcrypt (Password123!)

-- Insert default admin, developer, and client accounts (AdminPass123!, DevPass123!, ClientPass123!)
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, is_verified, bio)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@mvplaunch.ng', '$2a$10$FmmegrlyW9TlQaiwI5hZJO83h/DqgW32g4HAbLK8pN4EdKwkEnwgm', 'Emeka Okonkwo', '+2348031234567', 'ADMIN', true, true, 'Lead Architect & MVPLaunch Director'),
  ('22222222-2222-2222-2222-222222222222', 'developer@mvplaunch.ng', '$2a$10$NZQ22r4x6Wj2mbQ9iX369OH3VzbbafymK0BCdVbXzE7ecd6ll9P5u', 'Adebayo Olufemi', '+2348029876543', 'DEVELOPER', true, true, 'Senior Full-Stack MVP Engineer (Node.js & React)'),
  ('33333333-3333-3333-3333-333333333333', 'founder@quickretail.ng', '$2a$10$fzEkIUGrJS7dJ6A0OC4g3uICMTc4vj1CTvrIL2denleT9DSG48/h6', 'Chioma Adeleke', '+2348145556677', 'CLIENT', true, true, 'Founder of QuickRetail Nigeria'),
  ('44444444-4444-4444-4444-444444444444', 'student@unilag.edu.ng', '$2a$10$fzEkIUGrJS7dJ6A0OC4g3uICMTc4vj1CTvrIL2denleT9DSG48/h6', 'Tunde Bakare', '+2348123334455', 'CLIENT', true, true, 'UNILAG Final Year Tech Entrepreneur')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Insert Ideas
INSERT INTO ideas (id, client_id, title, raw_summary, target_industry, budget_bracket, target_timeline, status)
VALUES 
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'QuickRetail NG', 'A micro-inventory and WhatsApp commerce storefront engine for Alaba and Computer Village traders in Lagos.', 'E-commerce & Retail', '₦500,000 - ₦1,000,000', '3-4 Weeks', 'PROPOSAL_GENERATED')
ON CONFLICT (id) DO NOTHING;

-- Insert Problem Clarification
INSERT INTO problem_clarifications (idea_id, core_problem, alternative_solutions, unique_value_prop, why_now, monetization_hypothesis, status)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Traders lose up to 40% of sales because their WhatsApp status catalog requires manual back-and-forth price checking and manual account transfers.',
  'Shopify (too complex/expensive for Naira billing), Instagram DMs (unorganized order tracking).',
  'Instant 30-second mobile storefront with automated Paystack checkout and instant WhatsApp order dispatch.',
  'Cashless economy push in Nigeria and widespread WhatsApp Business adoption in commercial hubs.',
  '1.5% fee per transaction capped at ₦1,000 or flat monthly subscription of ₦4,500.',
  'VALIDATED'
) ON CONFLICT (idea_id) DO NOTHING;

-- Insert Customer Definition
INSERT INTO customer_definitions (idea_id, primary_persona, pain_points, distribution_channel, user_archetype, location_context)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Retail traders & gadget vendors selling on WhatsApp & Instagram',
  'Managing stock manually, confirming bank transfer alerts manually, dealing with unconfirmed payment receipts.',
  'WhatsApp direct outreach, trade associations at Computer Village Ikeja.',
  'Tech-savvy Nigerian merchant aged 22-38 with high WhatsApp usage.',
  'Lagos (Ikeja, Trade Fair, Alaba)'
) ON CONFLICT (idea_id) DO NOTHING;

-- Insert MVP Scope
INSERT INTO mvp_scopes (idea_id, must_have_features, out_of_scope_features, tech_stack_preferences, target_launch_date, complexity_rating, estimated_weeks, status)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '["Mobile-first customer product catalog", "Paystack direct checkout integration (Cards, USSD, Bank Transfer)", "Merchant admin inventory update page", "Automated WhatsApp order confirmation message link"]'::jsonb,
  '["Multi-currency foreign cards", "Native iOS/Android App (PWA only for MVP)", "Automated delivery dispatch riders integration"]'::jsonb,
  '["React.js", "Express.js", "PostgreSQL", "Paystack API"]'::jsonb,
  '2026-10-31',
  'MEDIUM',
  3,
  'FROZEN'
) ON CONFLICT (idea_id) DO NOTHING;
