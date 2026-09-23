/**
 * MVPLaunch NG - Messages Validation Schemas
 */
const { z } = require('zod');

const sendMessageSchema = z.object({
  projectId: z.string().uuid(),
  content: z.string().min(1, 'Message content cannot be empty'),
  attachments: z.array(z.string()).default([])
});

module.exports = {
  sendMessageSchema
};
