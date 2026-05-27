const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const {
  getDashboardData,
  uploadPDF,
  submitQuery,
  addData,
  getData,
  exportExcel,
  getWorkbookTableData,
  replyQuery,
} = require('../controllers/dataController');

// All paths are completely flat here since the prefix is globally bound in app.js
router.get("/dashboard", getDashboardData);
router.post("/upload", upload.single("pdf"), uploadPDF);
router.post("/query", submitQuery);
router.post('/add', addData);
router.get('/all', getData);
router.get('/export', exportExcel);
router.get("/workbook/:tableName", getWorkbookTableData);
router.post("/reply", replyQuery);

module.exports = router;