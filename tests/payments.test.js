/**
 * Automated Tests: Paystack Payment Provider & Webhooks
 */
const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/app');
const paystackProvider = require('../src/providers/payment/paystack.provider');

describe('Paystack Provider & Webhook Security', () => {
  describe('Provider Unit Tests', () => {
    it('should initialize transaction and produce authorization URL', async () => {
      const initResult = await paystackProvider.initializeTransaction({
        email: 'test@founder.ng',
        amountNgn: 150000,
        reference: 'test_ref_001',
        callbackUrl: 'http://localhost:3000/callback'
      });

      expect(initResult).toHaveProperty('authorizationUrl');
      expect(initResult).toHaveProperty('reference');
      expect(initResult.reference).toBe('test_ref_001');
    });

    it('should verify transaction successfully in mock mode', async () => {
      const verifyResult = await paystackProvider.verifyTransaction('test_ref_001');

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.status).toBe('SUCCESSFUL');
      expect(verifyResult.amountNgn).toBeGreaterThan(0);
    });

    it('should validate cryptographic HMAC SHA512 signature correctly', () => {
      const secret = paystackProvider.secretKey;
      const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });

      const validSignature = crypto.createHmac('sha512', secret).update(payload).digest('hex');
      const isValid = paystackProvider.verifyWebhookSignature(validSignature, payload);

      expect(isValid).toBe(true);

      const invalidSignature = 'bad_tampered_signature_hex';
      const isInvalid = paystackProvider.verifyWebhookSignature(invalidSignature, payload);

      expect(isInvalid).toBe(false);
    });
  });

  describe('POST /api/v1/payments/webhook endpoint', () => {
    it('should reject webhook with invalid signature with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', 'fake_invalid_signature')
        .send({ event: 'charge.success' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('signature');
    });

    it('should accept valid signature webhook with 200 OK', async () => {
      const secret = paystackProvider.secretKey;
      const payload = { event: 'charge.success', data: { reference: 'mock_test_reference' } };
      const rawString = JSON.stringify(payload);
      const signature = crypto.createHmac('sha512', secret).update(rawString).digest('hex');

      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', signature)
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });
});
