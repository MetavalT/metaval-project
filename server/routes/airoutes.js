const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');

const {
  uploadAndProcessPDF,
} = require('../controllers/aiController');

router.post(
  '/upload-pdf',
  upload.single('file'),
  uploadAndProcessPDF
);

module.exports = router;