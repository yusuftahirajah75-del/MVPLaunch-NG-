/**
 * MVPLaunch NG - Paystack Payment Provider Implementation
 * Supports real Paystack API and simulated offline mock mode.
 */
const crypto = require('crypto');
const https = require('https');
const PaymentProvider = require('./payment.provider');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class PaystackProvider extends PaymentProvider {
  constructor() {
    super();
    this.secretKey = env.PAYSTACK_SECRET_KEY;
    this.publicKey = env.PAYSTACK_PUBLIC_KEY;
    this.baseUrl = env.PAYSTACK_BASE_URL;
    this.isMock = env.PAYSTACK_MOCK_MODE;
  }

  /**
   * Helper to make HTTP requests to Paystack API
   */
  _request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        method,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300 && parsed.status) {
              resolve(parsed.data);
            } else {
              reject(new Error(parsed.message || `Paystack error status ${res.statusCode}`));
            }
          } catch (err) {
            reject(new Error(`Failed to parse Paystack response: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  /**
   * Initialize Paystack checkout
   */
  async initializeTransaction({ email, amountNgn, reference, callbackUrl, metadata = {} }) {
    // Paystack takes amounts in Kobo (1 NGN = 100 Kobo)
    const amountKobo = Math.round(amountNgn * 100);

    if (this.isMock) {
      logger.info(`[Paystack MOCK] Initializing checkout for ${email} (₦${amountNgn})`);
      return {
        authorizationUrl: `${env.APP_URL}/api/v1/payments/mock-checkout?reference=${reference}`,
        reference,
        accessCode: `mock_code_${Date.now()}`
      };
    }

    const payload = {
      email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        platform: 'MVPLaunch NG'
      }
    };

    const data = await this._request('POST', '/transaction/initialize', payload);
    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
      accessCode: data.access_code
    };
  }

  /**
   * Verify transaction
   */
  async verifyTransaction(reference) {
    if (this.isMock) {
      logger.info(`[Paystack MOCK] Verifying transaction: ${reference}`);
      return {
        success: true,
        status: 'SUCCESSFUL',
        amountNgn: 250000,
        channel: 'mock_card',
        paidAt: new Date(),
        metadata: { gateway_response: 'Successful (Mock)', simulated: true }
      };
    }

    const data = await this._request('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
    const isSuccessful = data.status === 'success';

    return {
      success: isSuccessful,
      status: isSuccessful ? 'SUCCESSFUL' : 'FAILED',
      amountNgn: data.amount ? data.amount / 100 : 0,
      channel: data.channel || 'unknown',
      paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
      metadata: {
        gateway_response: data.gateway_response,
        bank: data.authorization?.bank,
        last4: data.authorization?.last4,
        card_type: data.authorization?.card_type
      }
    };
  }

  /**
   * Verify HMAC SHA512 signature on incoming Paystack Webhook
   */
  verifyWebhookSignature(signature, rawBody) {
    if (this.isMock && signature === 'mock_valid_signature') {
      return true;
    }
    if (!signature || !this.secretKey) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
      .digest('hex');

    return hash === signature;
  }
}

module.exports = new PaystackProvider();
