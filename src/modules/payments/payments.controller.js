/**
 * MVPLaunch NG - Payments Controller
 */
const paymentsService = require('./payments.service');
const ApiResponse = require('../../utils/apiResponse');

class PaymentsController {
  async initializePayment(req, res, next) {
    try {
      const result = await paymentsService.initializePayment(req.user, req.body, req);
      return ApiResponse.created(res, 'Payment initialized. Redirect user to authorization URL.', result);
    } catch (error) {
      next(error);
    }
  }

  async initializePackagePayment(req, res, next) {
    try {
      const result = await paymentsService.initializePackagePayment(req.body, req.user || null, req);
      return ApiResponse.created(res, 'Package checkout initialized. Redirecting to Paystack.', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const reference = req.params.reference || req.body.reference || req.query.reference;
      const result = await paymentsService.verifyPayment(reference, req.user || null, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req, res, next) {
    try {
      const signature = req.headers['x-paystack-signature'];
      const rawBody = req.rawBody || req.body;
      const result = await paymentsService.handleWebhook(rawBody, signature, req);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyPayments(req, res, next) {
    try {
      const { payments, pagination } = await paymentsService.getMyPayments(req.user.id, req.query);
      return ApiResponse.paginated(res, 'Payments retrieved', payments, pagination);
    } catch (error) {
      next(error);
    }
  }

  async mockCheckout(req, res, next) {
    try {
      const { reference } = req.query;
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>MVPLaunch NG - Mock Paystack Gateway</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0b1329; color: #fff; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #16203c; padding: 2.5rem; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 15px 35px rgba(0,0,0,0.6); max-width: 440px; width: 100%; text-align: center; }
            .badge { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; padding: 4px 12px; border-radius: 999px; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; display: inline-block; margin-bottom: 1rem; }
            h2 { margin: 0 0 0.5rem; font-size: 1.5rem; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
            code { background: #0f172a; border: 1px solid #334155; color: #38bdf8; padding: 8px 12px; border-radius: 8px; display: block; word-break: break-all; margin: 1rem 0; font-family: monospace; font-size: 13px; }
            .btn { background: #10b981; color: #022c22; border: none; padding: 14px 24px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 15px; margin-top: 15px; width: 100%; transition: all 0.2s; }
            .btn:hover { background: #34d399; transform: translateY(-1px); }
            .cancel-link { display: block; margin-top: 15px; color: #64748b; font-size: 13px; text-decoration: none; }
            .cancel-link:hover { color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Paystack Sandbox Simulator</span>
            <h2>Complete Paystack Payment</h2>
            <p>You are testing in offline Paystack Mock mode. Click below to simulate an authentic ₦ Card / Bank Transfer payment.</p>
            <code>${reference || 'N/A'}</code>
            <button class="btn" onclick="completePayment()">Simulate Successful Payment (200 OK)</button>
            <a class="cancel-link" href="/payments/callback?reference=${reference}&status=cancelled">Simulate Abandoned Payment</a>
          </div>
          <script>
            function completePayment() {
              window.location.href = '/payments/callback?reference=${reference}';
            }
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentsController();
