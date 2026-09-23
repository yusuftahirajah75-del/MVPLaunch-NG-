/**
 * MVPLaunch NG - Email Provider Interface
 */
class EmailProvider {
  async sendEmail({ to, subject, html, text }) {
    throw new Error('sendEmail() must be implemented.');
  }
}

module.exports = EmailProvider;
