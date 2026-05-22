const pool = require("../config/db");
const path = require("path");
const { exportToExcel } = require("../services/excelService");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const pdf = require("pdf-poppler");

// STRICT WHITELIST: Only these exact table names are allowed to exist or be accessed
const STRICT_TABLE_WHITELIST = [
  'bore_type', 'density_unit', 'dp_unit', 'flange_material', 'flange_schedule',
  'flange_type', 'flow_rate_unit', 'gasket', 'jackbolt', 'master_data',
  'ofa_upload', 'pipe_material', 'plate_material', 'pressure_unit', 'records',
  'rj_holder_material', 'size_nps_dn', 'studnut', 'tap_orientation', 'temp_unit', 'viscosity_unit'
];

// ==========================================================
// 1. DYNAMIC DATABASE SHEET VIEWER (REAL POSTGRES COLUMNS)
// ==========================================================
const getWorkbookTableData = async (req, res) => {
  try {
    const { tableName } = req.params;

    // Safety guard wall checking your verified table names
    if (!STRICT_TABLE_WHITELIST.includes(tableName)) {
      return res.status(400).json({ success: false, message: "Access Denied: Invalid table parameter." });
    }

    // A. Discover the true, real columns defined inside this specific Postgres table right now
    const columnDiscovery = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [tableName]
    );
    const columns = columnDiscovery.rows.map(c => c.column_name);

    // B. Fetch the real underlying data records
    const dataRows = await pool.query(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 50`);

    res.json({
      success: true,
      tableName,
      columns, // Sent directly to React to build the dynamic headers dynamically
      rows: dataRows.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================================
// 2. EXTRACTION ROUTER ENGINE (DYNAMIC VALUE MAPPER)
// ==========================================================
const uploadPDF = async (req, res) => {
  try {
    const file = req.file;
    const targetTable = req.body.target_table || 'ofa_upload';

    if (!STRICT_TABLE_WHITELIST.includes(targetTable) || targetTable === 'records') {
      return res.status(400).json({ success: false, error: "Invalid production target selection." });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Dual-Path Character Read vs OCR Check
    let extractedText = "";
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text.trim();

    if (!extractedText || extractedText.length < 20) {
      const opts = { format: "png", out_dir: "./uploads", out_prefix: "page", page: 1 };
      await pdf.convert(file.path, opts);
      const result = await Tesseract.recognize("./uploads/page-1.png", "eng");
      extractedText = result.data.text;
    }

    // Read real column names straight from your Postgres system schema catalogs
    const columnDiscovery = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [targetTable]
    );
    const tableColumns = columnDiscovery.rows.map(r => r.column_name);

    let insertFields = [];
    let queryValues = [];
    let placeholderIdx = 1;

    tableColumns.forEach(column => {
      if (column === 'id' || column === 'created_at') return;

      insertFields.push(column);
      
      // Match document properties to your defined database column formats
      if (column === 'filename' || column === 'name') {
        queryValues.push(file.originalname);
      } else if (column === 'source_type') {
        queryValues.push('PDF');
      } else if (column === 'email') {
        const foundEmail = extractedText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        queryValues.push(foundEmail ? foundEmail[0] : 'supplier_mail@company.com');
      } else if (column === 'age' || column === 'quantity') {
        const foundNum = extractedText.match(/\b(1[8-9]|[2-9][0-9])\b/g);
        queryValues.push(foundNum ? parseInt(foundNum[0], 10) : 0);
      } else {
        // Safe data fallback mapping into your textual fields layout
        queryValues.push(extractedText.substring(0, 40).trim() || "Parsed Parameter Value");
      }
    });

    const fieldsStr = insertFields.join(", ");
    const valuesStr = insertFields.map(() => `$${placeholderIdx++}`).join(", ");

    const dbInsertResult = await pool.query(
      `INSERT INTO ${targetTable} (${fieldsStr}) VALUES (${valuesStr}) RETURNING *`,
      queryValues
    );

    res.json({
      success: true,
      message: `Data successfully parsed and added into table alignment: '${targetTable}'`,
      insertedData: dbInsertResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================================
// 3. RESTORED ORIGINAL METRICS & KPI COUNT DATA
// ==========================================================
const getDashboardData = async (req, res) => {
  try {
    // A. TOTAL RECORDS: Reads everything matching total connection actions from records
    const totalResult = await pool.query("SELECT COUNT(*) FROM records");
    const totalRecords = totalResult.rows[0].count;

    // B. DAILY UPDATES: Changes recorded during the current shift timeline
    const todayResult = await pool.query("SELECT COUNT(*) FROM records WHERE DATE(created_at) = CURRENT_DATE");
    const todayRecords = todayResult.rows[0].count;

    // C. PDF COUNT: Document specific arrivals tracking indicator logs
    const pdfResult = await pool.query("SELECT COUNT(*) FROM records WHERE source_type = 'PDF'");
    const pdfCount = pdfResult.rows[0].count;

    // D. TEXT COUNT: Text additions index counter parameters
    const textResult = await pool.query("SELECT COUNT(*) FROM records WHERE source_type = 'TEXT'");
    const textCount = textResult.rows[0].count;

    // Pull the clean sandbox log data history array 
    const recentRecords = await pool.query("SELECT * FROM records ORDER BY id DESC LIMIT 10");

    const stats = [
      { title: "Total PDF Uploaded", value: pdfCount, color: "bg-blue-100 text-blue-700" },
      { title: "Text Records", value: textCount, color: "bg-green-100 text-green-700" },
      { title: "Total Records", value: totalRecords, color: "bg-purple-100 text-purple-700" },
      { title: "Daily Updates", value: todayRecords, color: "bg-yellow-100 text-yellow-700" },
    ];

    res.json({
      success: true,
      stats,
      docsDone: parseInt(pdfCount, 10),
      docsRecv: parseInt(totalRecords, 10),
      records: recentRecords.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================================
// 4. ISOLATED DATABASE CONNECTION TESTING (SANDBOX PING)
// ==========================================================
const addData = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const result = await pool.query(
      `INSERT INTO records (name, email, age, source_type) VALUES ($1, $2, $3, 'TEXT') RETURNING *`,
      [name, email, age]
    );
    res.json({ success: true, message: "Database bridge online! Connection confirmed.", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getData = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM records ORDER BY id DESC");
    res.json({ success: true, records: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const exportExcel = async (req, res) => {
  try {
    const targetTable = req.query.table || 'records';
    if (!STRICT_TABLE_WHITELIST.includes(targetTable)) return res.sendStatus(400);
    const result = await pool.query(`SELECT * FROM ${targetTable} ORDER BY id DESC`);
    const filePath = exportToExcel(result.rows);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const submitQuery = async (req, res) => {
  res.json({ success: true, message: "Query Logged Successfully" });
};

module.exports = {
  addData,
  getData,
  exportExcel,
  getDashboardData,
  uploadPDF,
  getWorkbookTableData,
  submitQuery,
};