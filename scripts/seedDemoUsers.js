/**
 * MVPLaunch NG - Standalone Script to Seed/Verify Demo Accounts
 */
require('dotenv').config();
const { ensureDemoUsers } = require('../src/modules/auth/demoSeed.service');
const db = require('../src/config/db');

async function main() {
  console.log('[Script] Verifying pre-seeded demo accounts...');
  await ensureDemoUsers();
  console.log('[Script] Demo accounts check complete.');
  await db.pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('[Script] Failed to verify demo accounts:', err);
  process.exit(1);
});
