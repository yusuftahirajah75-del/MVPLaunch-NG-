/**
 * MVPLaunch NG - Files Routes
 */
const { Router } = require('express');
const filesController = require('./files.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { upload } = require('../../providers/storage/local.storage.provider');

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), filesController.uploadFile);
router.get('/project/:projectId', filesController.getFilesByProject);
router.delete('/:id', filesController.deleteFile);

module.exports = router;
