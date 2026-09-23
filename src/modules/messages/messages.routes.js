/**
 * MVPLaunch NG - Messages Routes
 */
const { Router } = require('express');
const messagesController = require('./messages.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sendMessageSchema } = require('./messages.validation');

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: sendMessageSchema }), messagesController.sendMessage);
router.get('/project/:projectId', messagesController.getMessagesByProject);

module.exports = router;
