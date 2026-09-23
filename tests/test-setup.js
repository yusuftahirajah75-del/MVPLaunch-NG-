/**
 * Jest Setup File (runs before test framework is installed)
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_automated_testing_12345';
process.env.PAYSTACK_MOCK_MODE = 'true';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key_for_testing';
