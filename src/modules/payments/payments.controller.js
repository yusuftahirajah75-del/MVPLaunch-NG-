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

  async verifyPayment(req, res, next) {
    try {
      const result = await paymentsService.verifyPayment(req.body.reference, req.user, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req, res, next) {
    try {
      const signature = req.headers['x-paystack-signature'];
      const result = await paymentsService.handleWebhook(req.body, signature, req);
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
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #fff; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 420px; width: 100%; text-align: center; }
            .badge { background: #0284c7; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; text-transform: uppercase; font-weight: bold; }
            .btn { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-top: 20px; width: 100%; }
            .btn:hover { background: #059669; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Development Mock Mode</span>
            <h2>Paystack Payment Simulation</h2>
            <p style="color: #94a3b8; font-size: 14px;">Simulate successful card/bank checkout for reference:</p>
            <code style="background: #334155; padding: 6px 12px; border-radius: 6px; display: block; word-break: break-all;">${reference || 'N/A'}</code>
            <button class="btn" onclick="completePayment()">Simulate Successful Payment</button>
          </div>
          <script>
            async function completePayment() {
              const res = await fetch('/api/v1/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: '${reference}' })
              });
              const data = await res.json();
              if (data.success) {
                alert('Payment verified successfully!');
                window.location.href = '/api/v1/orders';
              } else {
                alert('Payment failed: ' + data.message);
              }
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
