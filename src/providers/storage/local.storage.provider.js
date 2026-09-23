/**
 * MVPLaunch NG - Local Disk Storage Provider Implementation
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const StorageProvider = require('./storage.provider');
const env = require('../../config/env');
const ApiError = require('../../utils/apiError');

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 // e.g. 15MB
  },
  fileFilter: (req, file, cb) => {
    // Whitelist common MVP specifications, assets, documents, and code archives
    const allowedExtensions = /jpeg|jpg|png|webp|pdf|docx|txt|zip|tar|gz|json|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedExtensions.test(ext)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Unsupported file format (.${ext}). Allowed: pdf, docx, txt, zip, png, jpg, webp, svg, json`));
    }
  }
});

class LocalStorageProvider extends StorageProvider {
  getFileUrl(filename) {
    return `${env.APP_URL}/uploads/${filename}`;
  }

  async deleteFile(filename) {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  }
}

module.exports = {
  upload,
  localStorageProvider: new LocalStorageProvider()
};
