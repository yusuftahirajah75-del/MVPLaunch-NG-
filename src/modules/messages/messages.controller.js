/**
 * MVPLaunch NG - Messages Controller
 */
const messagesService = require('./messages.service');
const ApiResponse = require('../../utils/apiResponse');

class MessagesController {
  async sendMessage(req, res, next) {
    try {
      const message = await messagesService.sendMessage(req.user, req.body);
      return ApiResponse.created(res, 'Message sent successfully', { message });
    } catch (error) {
      next(error);
    }
  }

  async getMessagesByProject(req, res, next) {
    try {
      const { messages, pagination } = await messagesService.getMessagesByProject(req.params.projectId, req.user, req.query);
      return ApiResponse.paginated(res, 'Messages retrieved', messages, pagination);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessagesController();
