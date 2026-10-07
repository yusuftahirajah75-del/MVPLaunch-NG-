/**
 * MVPLaunch NG - Idempotent Demo Accounts Seeder
 * Ensures default internal test roles exist and have valid credentials.
 * Safe, idempotent, and non-destructive.
 */
const db = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');
const logger = require('../../utils/logger');

const DEMO_ACCOUNTS = [
  {
    email: 'admin@mvplaunch.ng',
    password: 'AdminPass123!',
    fullName: 'Emeka Okonkwo',
    phoneNumber: '+2348031234567',
    role: 'ADMIN',
    bio: 'Lead Architect & MVPLaunch Platform Director'
  },
  {
    email: 'developer@mvplaunch.ng',
    password: 'DevPass123!',
    fullName: 'Adebayo Olufemi',
    phoneNumber: '+2348029876543',
    role: 'DEVELOPER',
    bio: 'Senior Full-Stack MVP Engineer (Node.js, Express, React, PostgreSQL)',
    skills: 'React, Node.js, Express, PostgreSQL, REST APIs, Paystack Integration, Tailwind/CSS',
    availability_status: 'AVAILABLE',
    specializations: JSON.stringify(['FinTech', 'E-commerce', 'SaaS', 'Marketplace', 'EdTech'])
  },
  {
    email: 'engineer.fatima@mvplaunch.ng',
    password: 'DevPass123!',
    fullName: 'Fatima Danjuma',
    phoneNumber: '+2348039887766',
    role: 'DEVELOPER',
    bio: 'Full-Stack & AI Systems Engineer (Python, FastAPI, React, Node.js)',
    skills: 'Python, FastAPI, AI / Machine Learning, Node.js, React, Docker, Cloud Deployments',
    availability_status: 'AVAILABLE',
    specializations: JSON.stringify(['AI / Machine Learning', 'AI Agents / Automation', 'AgriTech', 'HealthTech', 'PropTech'])
  },
  {
    email: 'founder@quickretail.ng',
    password: 'ClientPass123!',
    fullName: 'Chioma Adeleke',
    phoneNumber: '+2348145556677',
    role: 'CLIENT',
    bio: 'Founder of QuickRetail Nigeria'
  },
  {
    email: 'student@unilag.edu.ng',
    password: 'ClientPass123!',
    fullName: 'Tunde Bakare',
    phoneNumber: '+2348123334455',
    role: 'CLIENT',
    bio: 'UNILAG Final Year Tech Entrepreneur'
  }
];

/**
 * Idempotently check and seed or repair test accounts
 */
async function ensureDemoUsers() {
  for (const acc of DEMO_ACCOUNTS) {
    try {
      const res = await db.query(
        `SELECT id, email, password_hash, role, is_active FROM users WHERE LOWER(email) = LOWER($1)`,
        [acc.email]
      );

      if (res.rows.length === 0) {
        // Create missing user
        const passwordHash = await hashPassword(acc.password);
        await db.query(
          `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_verified, bio, skills, availability_status, specializations)
           VALUES (LOWER($1), $2, $3, $4, $5, true, true, $6, $7, $8, $9::jsonb)`,
          [
            acc.email,
            passwordHash,
            acc.fullName,
            acc.phoneNumber,
            acc.role,
            acc.bio,
            acc.skills || null,
            acc.availability_status || 'AVAILABLE',
            acc.specializations || '[]'
          ]
        );
        logger.info(`[DemoSeed] Created missing test account: ${acc.email} (${acc.role})`);
      } else {
        const existing = res.rows[0];
        let isMatch = false;
        try {
          isMatch = await comparePassword(acc.password, existing.password_hash);
        } catch (e) {
          isMatch = false;
        }

        const newHash = isMatch ? existing.password_hash : await hashPassword(acc.password);

        await db.query(
          `UPDATE users 
           SET password_hash = $1, 
               is_active = true, 
               full_name = $2, 
               bio = $3,
               skills = COALESCE($4, skills),
               availability_status = COALESCE($5, availability_status),
               specializations = COALESCE($6::jsonb, specializations)
           WHERE id = $7`,
          [
            newHash,
            acc.fullName,
            acc.bio,
            acc.skills || null,
            acc.availability_status || null,
            acc.specializations || null,
            existing.id
          ]
        );
      }
    } catch (err) {
      logger.error(`[DemoSeed] Error verifying test account ${acc.email}:`, err.message);
    }
  }
}

module.exports = {
  DEMO_ACCOUNTS,
  ensureDemoUsers
};
