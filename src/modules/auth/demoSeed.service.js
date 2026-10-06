/**
 * MVPLaunch NG - Idempotent Demo Accounts Seeder
 * Ensures default pre-seeded test roles exist and have valid credentials.
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
    bio: 'Lead Architect & MVPLaunch Director'
  },
  {
    email: 'developer@mvplaunch.ng',
    password: 'DevPass123!',
    fullName: 'Adebayo Olufemi',
    phoneNumber: '+2348029876543',
    role: 'DEVELOPER',
    bio: 'Senior Full-Stack MVP Engineer (Node.js & React)'
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
 * Idempotently check and seed or repair demo accounts
 */
async function ensureDemoUsers() {
  for (const acc of DEMO_ACCOUNTS) {
    try {
      const res = await db.query(
        `SELECT id, email, password_hash, role, is_active FROM users WHERE LOWER(email) = LOWER($1)`,
        [acc.email]
      );

      if (res.rows.length === 0) {
        // Create missing demo user
        const passwordHash = await hashPassword(acc.password);
        await db.query(
          `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_verified, bio)
           VALUES (LOWER($1), $2, $3, $4, $5, true, true, $6)`,
          [acc.email, passwordHash, acc.fullName, acc.phoneNumber, acc.role, acc.bio]
        );
        logger.info(`[DemoSeed] Created missing demo account: ${acc.email} (${acc.role})`);
      } else {
        const existing = res.rows[0];
        let isMatch = false;
        try {
          isMatch = await comparePassword(acc.password, existing.password_hash);
        } catch (e) {
          isMatch = false;
        }

        if (!isMatch) {
          const newHash = await hashPassword(acc.password);
          await db.query(
            `UPDATE users SET password_hash = $1, is_active = true WHERE id = $2`,
            [newHash, existing.id]
          );
          logger.info(`[DemoSeed] Repaired password hash for demo account: ${acc.email}`);
        }
      }
    } catch (err) {
      logger.error(`[DemoSeed] Error verifying demo account ${acc.email}:`, err.message);
    }
  }
}

module.exports = {
  DEMO_ACCOUNTS,
  ensureDemoUsers
};
