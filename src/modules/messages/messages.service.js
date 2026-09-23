/**
 * MVPLaunch NG - Messages Service
 */
const messagesRepo = require('./messages.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const db = require('../../config/db');

class MessagesService {
  async sendMessage(user, { projectId, content, attachments }) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to post messages to this project thread.');
    }

    const message = await messagesRepo.create({
      projectId,
      senderId: user.id,
      content,
      attachments
    });

    // Notify the other party
    const recipientId = user.id === project.client_id ? project.developer_id : project.client_id;
    if (recipientId) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, metadata)
         VALUES ($1, $2, $3, 'NEW_MESSAGE', $4)`,
        [
          recipientId,
          `New message from ${user.full_name}`,
          content.substring(0, 100),
          JSON.stringify({ projectId, messageId: message.id })
        ]
      );
    }

    return message;
  }

  async getMessagesByProject(projectId, user, query) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to view project messages.');
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const offset = (page - 1) * limit;

    const { messages, total } = await messagesRepo.findByProjectId(projectId, { limit, offset });

    // Mark messages from other user as read
    await messagesRepo.markAsRead(projectId, user.id);

    return { messages, pagination: { page, limit, total } };
  }
}

module.exports = new MessagesService();
