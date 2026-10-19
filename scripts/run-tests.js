// Force test environment flags before any application imports
process.env.NODE_ENV = 'test';
process.env.SKIP_RATE_LIMIT = 'true';
process.env.PAYSTACK_MOCK_MODE = 'true';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key_for_testing';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_automated_testing_12345';

const { runCLI } = require('jest');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const testMatch = args.length > 0
    ? args.map(arg => arg.startsWith('tests/') ? `<rootDir>/${arg}` : `<rootDir>/tests/${arg}`)
    : ['<rootDir>/tests/*.test.js'];

  const jestConfig = {
    testEnvironment: 'node',
    setupFiles: [path.resolve(__dirname, '../tests/test-setup.js')],
    testMatch,
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/frontend/', '<rootDir>/uploads/'],
    modulePathIgnorePatterns: ['<rootDir>/frontend/'],
    runInBand: true,
    forceExit: true,
    verbose: true
  };

  try {
    const { results } = await runCLI(jestConfig, [path.resolve(__dirname, '..')]);
    if (!results.success) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('[TestRunner] Execution failed:', err);
    process.exit(1);
  }
}

main();
