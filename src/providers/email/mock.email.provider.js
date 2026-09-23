/**
 * MVPLaunch NG - Mock & SMTP Email Provider
 */
const EmailProvider = require('./email.provider');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class MockEmailProvider extends EmailProvider {
  async sendEmail({ to, subject, html, text }) {
    logger.info(`[Email Service] Sent email to: ${to} | Subject: ${subject}`);
    return {
      messageId: `mock_email_${Date.now()}`,
      accepted: [to],
      rejected: []
    };
  }
}

module.exports = new MockEmailProvider();
