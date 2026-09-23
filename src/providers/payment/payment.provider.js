/**
 * MVPLaunch NG - Payment Provider Interface
 */
class PaymentProvider {
  /**
   * Initialize a checkout transaction
   * @param {object} params
   * @param {string} params.email
   * @param {number} params.amountNgn
   * @param {string} params.reference
   * @param {string} params.callbackUrl
   * @param {object} params.metadata
   * @returns {Promise<{ authorizationUrl: string, reference: string, accessCode: string }>}
   */
  async initializeTransaction(params) {
    throw new Error('initializeTransaction() must be implemented by payment provider.');
  }

  /**
   * Verify transaction status with payment gateway
   * @param {string} reference
   * @returns {Promise<{ success: boolean, status: string, amountNgn: number, channel: string, metadata: object, paidAt: Date }>}
   */
  async verifyTransaction(reference) {
    throw new Error('verifyTransaction() must be implemented by payment provider.');
  }

  /**
   * Verify webhook signature from provider
   * @param {string} signature
   * @param {string|Buffer} rawBody
   * @returns {boolean}
   */
  verifyWebhookSignature(signature, rawBody) {
    throw new Error('verifyWebhookSignature() must be implemented by payment provider.');
  }
}

module.exports = PaymentProvider;
