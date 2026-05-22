const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware")

const {
  getDashboardData,
  uploadPDF,
  submitQuery,
  downloadExcel,
  addData,
  getData,
  exportExcel,
  getWorkbookTableData,
} = require('../controllers/dataController');

router.get("/dashboard", getDashboardData)
router.post("/upload", upload.single("pdf"), uploadPDF)
router.post("/query", submitQuery)
router.get("/download-excel", exportExcel)
router.post('/add', addData);
router.get('/all', getData);
router.get('/export', exportExcel);
router.get("/workbook/:tableName", getWorkbookTableData);

module.exports = router;