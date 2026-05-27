const pool = require("../config/db");
const { exportToExcel } = require("../services/excelService");

// IMPORTING Standalone Modular Core Services
const { extractTextFromPDF } = require("../services/pdfService");
const { mapTextToColumnsStrategy } = require("../services/strategyMatcher");
const { buildWorkbookSearchQuery } = require("../services/queryFilterService");

// Whitelist validation boundaries
const STRICT_TABLE_WHITELIST = [
  'bore_type', 'density_unit', 'dp_unit', 'flange_material', 'flange_schedule',
  'flange_type', 'flow_rate_unit', 'gasket', 'jackbolt', 'master_data',
  'ofa_upload', 'pipe_material', 'plate_material', 'pressure_unit', 'records',
  'rj_holder_material', 'size_nps_dn', 'studnut', 'tap_orientation', 'temp_unit', 'viscosity_unit'
];

// ==========================================================
// 1. DYNAMIC GRID INQUIRY SYSTEM
// ==========================================================
const getWorkbookTableData = async (req, res) => {
  try {
    const { tableName } = req.params;
    if (!STRICT_TABLE_WHITELIST.includes(tableName)) {
      return res.status(400).json({ success: false, message: "Access Denied: Invalid table selection." });
    }

    const columnDiscovery = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [tableName]
    );
    const columns = columnDiscovery.rows.map(c => c.column_name);

    const { baseQueryString, sqlArguments } = buildWorkbookSearchQuery(tableName, req.query, columns);
    const finalizedQuery = baseQueryString + ` ORDER BY id DESC LIMIT 50`;
    const filteredRows = await pool.query(finalizedQuery, sqlArguments);

    res.json({ success: true, tableName, columns, rows: filteredRows.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================================
// 2. INDUSTRIAL DOCUMENT EXTRACTION PIPELINE
// ==========================================================
const uploadPDF = async (req, res) => {
  try {
    const file = req.file;
    const targetTable = req.body.target_table || 'ofa_upload';

    if (!STRICT_TABLE_WHITELIST.includes(targetTable) || targetTable === 'records') {
      return res.status(400).json({ success: false, error: "Invalid target spreadsheet selection." });
    }
    if (!file) return res.status(400).json({ success: false, message: "No document attached." });

    // A. Parse document raw text
    const extractedText = await extractTextFromPDF(file.path);

    // B. Query database metadata details directly
    const columnDiscovery = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [targetTable]
    );

    // C. Evaluate matching profiles using our newly verified strategy matcher
    const queryValues = mapTextToColumnsStrategy(columnDiscovery.rows, extractedText, file);
    const tableColumns = columnDiscovery.rows.map(r => r.column_name);

    // D. Isolate structural sequences for custom database parameters mapping
    const insertFields = tableColumns.filter(col => col !== 'id' && col !== 'created_at');
    
    // ✅ ESCAPING WRAPPER: Ensures spacing inputs like "Item Name" never confuse the parser!
    const fieldsStr = insertFields.map(col => `"${col}"`).join(", ");
    const valuesStr = insertFields.map((_, index) => `$${index + 1}`).join(", ");

    const dbInsertResult = await pool.query(
      `INSERT INTO ${targetTable} (${fieldsStr}) VALUES (${valuesStr}) RETURNING *`,
      queryValues
    );

    res.json({
      success: true,
      message: `Document processed and logged inside table: ${targetTable}`,
      insertedData: dbInsertResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Modular Pipeline Intercept Error: " + err.message });
  }
};

// ==========================================================
// 3. EXCEL BACKEND EXPORT ENGINE
// ==========================================================
const exportExcel = async (req, res) => {
  try {
    const targetTable = req.query.table || 'records';
    if (!STRICT_TABLE_WHITELIST.includes(targetTable)) return res.sendStatus(400);

    const columnDiscovery = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [targetTable]
    );
    const columns = columnDiscovery.rows.map(c => c.column_name);

    let { baseQueryString, sqlArguments } = buildWorkbookSearchQuery(targetTable, req.query, columns);
    baseQueryString += ` ORDER BY id DESC`;

    const result = await pool.query(baseQueryString, sqlArguments);
    const filePath = exportToExcel(result.rows);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================================
// 4. METRICS AGGREGATION & TELEMETRY SYSTEMS
// ==========================================================
const getDashboardData = async (req, res) => {
  try {
    const ofaCountResult = await pool.query("SELECT COUNT(*) FROM ofa_upload");
    const masterCountResult = await pool.query("SELECT COUNT(*) FROM master_data");
    const totalRecordsResult = await pool.query("SELECT COUNT(*) FROM records");
    
    const dailyUpdatesResult = await pool.query(
      `
      SELECT (SELECT COUNT(*) FROM ofa_upload WHERE DATE(created_at) = CURRENT_DATE) +
             (SELECT COUNT(*) FROM master_data WHERE DATE(created_at) = CURRENT_DATE) +
             (SELECT COUNT(*) FROM records WHERE DATE(created_at) = CURRENT_DATE) as daily_total
      `
    );

    const stats = [
      { title: "Ofa Upload Records", value: ofaCountResult.rows[0].count, color: "bg-blue-100 text-blue-700" },
      { title: "Master Data Specs", value: masterCountResult.rows[0].count, color: "bg-green-100 text-green-700" },
      { title: "Connection Sandbox Logs", value: totalRecordsResult.rows[0].count, color: "bg-purple-100 text-purple-700" },
      { title: "Daily System Actions", value: dailyUpdatesResult.rows[0].daily_total || 0, color: "bg-yellow-100 text-yellow-700" },
    ];

    const currentQueriesFeed = await pool.query("SELECT * FROM queries WHERE is_resolved = FALSE ORDER BY id DESC LIMIT 10");

    res.json({
      success: true,
      stats,
      docsDone: parseInt(ofaCountResult.rows[0].count, 10),
      docsRecv: parseInt(ofaCountResult.rows[0].count, 10) + parseInt(masterCountResult.rows[0].count, 10),
      records: currentQueriesFeed.rows 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================================
// 5. QUERY SYSTEM GATEWAYS WITH SERVER CLOCK RECORDING
// ==========================================================
const submitQuery = async (req, res) => {
  try {
    // Fallbacks guarantee that fields are never passed as 'undefined' variables
    const sender_name = req.body.sender_name || "Office User";
    const sender_email = req.body.sender_email || "no-reply@office.com";
    const receiver_email = req.body.receiver_email || "admin@office.com";
    const message = req.body.message || "";

    if (!message) {
      return res.status(400).json({ success: false, error: "Message content cannot be blank." });
    }

    // Explicitly matching table inputs
    const result = await pool.query(
      `INSERT INTO queries (sender_name, sender_email, receiver_email, message, is_resolved) 
       VALUES ($1, $2, $3, $4, FALSE) 
       RETURNING *, created_at as automatic_timestamp`,
      [sender_name, sender_email, receiver_email, message]
    );
    
    res.json({ success: true, message: "Query routed safely.", data: result.rows[0] });
  } catch (err) {
    // This transmits the exact error to your console so you can trace it instantly
    console.error("CRITICAL SQL ERROR IN SUBMIT_QUERY:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
const addData = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const result = await pool.query(
      `INSERT INTO records (name, email, age, source_type) VALUES ($1, $2, $3, 'TEXT') RETURNING *`,
      [name, email, age]
    );
    res.json({ success: true, data: result.rows[0] });
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

const replyQuery = async (req, res) => {
  try {
    const { queryId, reply_text } = req.body;
    // Update resolution parameters and attach response text string
    await pool.query(
      "UPDATE queries SET reply_text = $1, is_resolved = TRUE WHERE id = $2",
      [reply_text, queryId]
    );
    res.json({ success: true, message: "Reply dispatched. Notification cleared." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = {
  addData,
  getData,
  exportExcel,
  getDashboardData,
  uploadPDF,
  getWorkbookTableData,
  submitQuery,
  replyQuery
};