/**
 * MVPLaunch NG - Paystack Payment Provider Implementation
 * Supports real Paystack Live/Test API with constant-time HMAC-SHA512 verification,
 * server-side pricing enforcement, and strict production mock isolation.
 */
const crypto = require('crypto');
const https = require('https');
const PaymentProvider = require('./payment.provider');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/apiError');

class PaystackProvider extends PaymentProvider {
  constructor() {
    super();
    this.secretKey = env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = env.PAYSTACK_PUBLIC_KEY || '';
    this.baseUrl = env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
    // Strict isolation: production NEVER allows mock mode under any circumstances
    this.isMock = env.NODE_ENV === 'production' ? false : Boolean(env.PAYSTACK_MOCK_MODE);
  }

  /**
   * Helper to make secure HTTPS requests to Paystack API
   * Includes timeouts, robust error masking, and JSON parse guards.
   */
  _request(method, endpoint, data = null, timeoutMs = 25000) {
    return new Promise((resolve, reject) => {
      // Configuration validation
      if (!this.secretKey || (this.secretKey.startsWith('sk_test_mock_') && env.NODE_ENV === 'production')) {
        return reject(
          ApiError.internal(
            'Paystack Secret Key is missing or invalid in server environment. Please configure PAYSTACK_SECRET_KEY in production.'
          )
        );
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(endpoint, this.baseUrl);
      } catch (err) {
        return reject(ApiError.internal(`Invalid Paystack endpoint URL: ${err.message}`));
      }

      const options = {
        method,
        headers: {
          Authorization: `Bearer ${this.secretKey.trim()}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MVPLaunch-NG-Payment-Client/1.0'
        }
      };

      const req = https.request(parsedUrl, options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300 && parsed.status) {
              resolve(parsed.data);
            } else {
              const errorMessage = parsed.message || `Paystack API returned status ${res.statusCode}`;
              logger.warn(`[Paystack API] Request rejected: ${errorMessage}`);
              reject(ApiError.badRequest(errorMessage));
            }
          } catch (err) {
            logger.error('[Paystack API] Failed to parse response JSON:', err.message);
            reject(ApiError.badGateway(`Failed to parse response from Paystack servers.`));
          }
        });
      });

      // Request Timeout Guard (prevents hanging requests)
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`Paystack API request timed out after ${timeoutMs}ms.`));
      });

      req.on('error', (err) => {
        logger.error('[Paystack API] Network error during request:', err.message);
        reject(ApiError.badGateway(`Could not connect to Paystack payment gateway: ${err.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  /**
   * Initialize Paystack checkout
   * Converts Naira to Kobo and requests genuine checkout URL.
   */
  async initializeTransaction({ email, amountNgn, reference, callbackUrl, metadata = {} }) {
    // Paystack takes amounts in Kobo (1 NGN = 100 Kobo)
    const amountKobo = Math.round(Number(amountNgn) * 100);

    // Development-only offline simulation
    if (this.isMock) {
      if (env.NODE_ENV === 'production') {
        throw ApiError.internal('Mock payment simulator is strictly prohibited in production mode.');
      }
      logger.info(`[Paystack MOCK] Initializing development checkout for ${email} (₦${amountNgn})`);
      return {
        authorizationUrl: `${env.APP_URL}/api/v1/payments/mock-checkout?reference=${reference}`,
        reference,
        accessCode: `mock_code_${Date.now()}`
      };
    }

    const payload = {
      email: email.trim().toLowerCase(),
      amount: amountKobo,
      currency: 'NGN',
      reference,
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        platform: 'MVPLaunch NG'
      }
    };

    const data = await this._request('POST', '/transaction/initialize', payload);

    if (!data || !data.authorization_url) {
      throw ApiError.badGateway('Paystack did not return a valid checkout authorization URL.');
    }

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference || reference,
      accessCode: data.access_code
    };
  }

  /**
   * Verify transaction directly with Paystack servers
   * @param {string} reference
   * @param {object} [expectedPayment]
   */
  async verifyTransaction(reference, expectedPayment = null) {
    // Development-only offline simulation
    if (this.isMock) {
      if (env.NODE_ENV === 'production') {
        throw ApiError.internal('Mock payment simulator is strictly prohibited in production mode.');
      }
      logger.info(`[Paystack MOCK] Simulating verification for: ${reference}`);
      const mockAmount = expectedPayment ? parseFloat(expectedPayment.amount_ngn) : 15000;
      return {
        success: true,
        status: 'SUCCESSFUL',
        amountNgn: mockAmount,
        amountKobo: Math.round(mockAmount * 100),
        currency: 'NGN',
        channel: 'card',
        paidAt: new Date(),
        paystackTransactionId: `mock_tx_${Date.now()}`,
        metadata: { gateway_response: 'Successful (Mock Simulation)', simulated: true }
      };
    }

    const data = await this._request('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
    const isSuccessful = data.status === 'success';

    return {
      success: isSuccessful,
      status: isSuccessful ? 'SUCCESSFUL' : (data.status ? String(data.status).toUpperCase() : 'FAILED'),
      amountKobo: data.amount || 0,
      amountNgn: data.amount ? data.amount / 100 : 0,
      currency: data.currency || 'NGN',
      channel: data.channel || 'card',
      paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
      paystackTransactionId: data.id ? String(data.id) : null,
      customerEmail: data.customer?.email || null,
      metadata: {
        gateway_response: data.gateway_response,
        bank: data.authorization?.bank,
        last4: data.authorization?.last4,
        card_type: data.authorization?.card_type,
        ip_address: data.ip_address,
        paystack_metadata: data.metadata
      }
    };
  }

  /**
   * Verify HMAC-SHA512 signature on incoming Paystack Webhook
   * Uses constant-time buffer comparison to prevent timing attacks.
   * @param {string} signature
   * @param {string|Buffer|object} rawBody
   */
  verifyWebhookSignature(signature, rawBody) {
    // Development mock signature strictly disallowed in production
    if (env.NODE_ENV !== 'production' && this.isMock && signature === 'mock_valid_signature') {
      return true;
    }

    if (!signature || !this.secretKey) {
      return false;
    }

    try {
      const bodyString = typeof rawBody === 'string'
        ? rawBody
        : (Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody));

      const hash = crypto
        .createHmac('sha512', this.secretKey.trim())
        .update(bodyString)
        .digest('hex');

      const hashBuffer = Buffer.from(hash, 'hex');
      const sigBuffer = Buffer.from(signature, 'hex');

      if (hashBuffer.length !== sigBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(hashBuffer, sigBuffer);
    } catch (err) {
      logger.warn('[Paystack Webhook] Signature verification error:', err.message);
      return false;
    }
  }
}

module.exports = new PaystackProvider();
