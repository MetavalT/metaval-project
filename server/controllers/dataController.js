const pool = require("../config/db");
const { exportToExcel } = require("../services/excelService");
const { exec } = require("child_process");
const path = require("path");
// IMPORTING Standalone Modular Core Services
const { extractTextFromPDF } = require("../services/pdfService");
const { mapTextToColumnsStrategy } = require("../services/strategyMatcher");
const { buildWorkbookSearchQuery } = require("../services/queryFilterService");

// // Whitelist validation boundaries
// const STRICT_TABLE_WHITELIST = [
//   'bore_type', 'density_unit', 'dp_unit', 'flange_material', 'flange_schedule',
//   'flange_type', 'flow_rate_unit', 'gasket', 'jackbolt', 'master_data',
//   'ofa_upload', 'pipe_material', 'plate_material', 'pressure_unit', 'records',
//   'rj_holder_material', 'size_nps_dn', 'studnut', 'tap_orientation', 'temp_unit', 'viscosity_unit'
// ];

/**
 * 🔒 ZERO HARD-BINDING SECURITY GUARD
 * Polling PostgreSQL system catalogs directly to confirm table existence.
 * Protects against raw malicious string inputs and SQL injections.
 */
const verifyTableExistsDynamically = async (tableName) => {
  try {
    if (!tableName) return false;
    const cleanTableName = String(tableName).toLowerCase().trim();

    // Directly interrogate the internal system table definitions schema catalog
    const catalogCheck = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND LOWER(table_name) = $1`,
      [cleanTableName]
    );

    return catalogCheck.rows.length > 0;
  } catch (err) {
    console.error("[SECURITY EXCEPTION] Table catalog verification failed:", err.message);
    return false;
  }
};

// =====================================================================
// 📊 1. DYNAMIC DATA LEDGER RECONSTRUCTION VIEWPORT
// =====================================================================
const getWorkbookTableData = async (req, res) => {
  try {
    let { tableName } = req.params;
    if (tableName) tableName = tableName.toLowerCase().trim();

    // 🔍 DYNAMIC GATEWAY: Instantly verify table sovereignty against live DB engine catalogs
    const isTableValid = await verifyTableExistsDynamically(tableName);
    if (!isTableValid) {
      return res.status(400).json({ success: false, message: `Access Denied: The requested worksheet layout '${tableName}' does not exist.` });
    }

    // Capture column keys and sorting arrays dynamically
    const columnDiscovery = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_schema = 'public' AND LOWER(table_name) = $1 
       ORDER BY ordinal_position`,
      [tableName]
    );

    if (columnDiscovery.rows.length === 0) {
      return res.json({ success: true, tableName, columns: [], rows: [] });
    }

    const columnsList = columnDiscovery.rows.map(c => c.column_name);

    // Build parametric SQL lookups directly matching your custom folder filter properties
    const { baseQueryString, sqlArguments } = buildWorkbookSearchQuery(tableName, req.query, columnsList);
    
    // ✅ NO HARD-CODING: Dynamically order rows on whatever variable occupies index zero (your precise A1 cell location)
    const dynamicSortingAnchor = `"${columnsList[0]}"`;
    const finalizedQuery = baseQueryString + ` ORDER BY ${dynamicSortingAnchor} ASC LIMIT 50`;
    
    const filteredRows = await pool.query(finalizedQuery, sqlArguments);

    return res.json({ 
      success: true, 
      tableName, 
      columns: columnsList, 
      rows: filteredRows.rows 
    });

  } catch (err) {
    console.error("DYNAMIC INQUIRY ENGINE FAULT:", err.message);
    return res.status(500).json({ success: false, error: "Database inquiry pipeline failure: " + err.message });
  }
};

// =====================================================================
// 📤 2. DYNAMIC FIELD DATA EXTRACTION & EXTRACTION INGESTION ENGINE
// =====================================================================
const uploadPDF = async (req, res) => {
  try {
    const fileAsset = req.file;
    const targetSpreadsheet = req.body.target_table ? req.body.target_table.toLowerCase().trim() : 'ofa_upload';

    // 🔍 DYNAMIC GATEWAY: Block unauthorized storage inputs on the fly
    const isTableValid = await verifyTableExistsDynamically(targetSpreadsheet);
    if (!isTableValid || targetSpreadsheet === 'queries') {
      return res.status(400).json({ success: false, error: `Invalid Target: Workspace sheet table '${targetSpreadsheet}' is unavailable.` });
    }
    if (!fileAsset) return res.status(400).json({ success: false, message: "No document attached to request." });

    // Instantly discover target column parameters straight from the dynamic catalogs
    const schemaCatalogDiscovery = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_schema = 'public' AND LOWER(table_name) = $1 
       ORDER BY ordinal_position`,
      [targetSpreadsheet]
    );

    const pythonScriptWorkerPath = path.join(__dirname, "../workers/extractor.py");
    
    // Execute background worker processes cleanly
    exec(`python3 "${pythonScriptWorkerPath}" "${fileAsset.path}"`, async (err, stdout, stderr) => {
      if (err) {
        console.error("Python processing exception thrown:", stderr || err.message);
        return res.status(500).json({ success: false, error: "Document text canvas extraction processing aborted." });
      }

      try {
        const scriptResult = JSON.parse(stdout);
        if (!scriptResult.success) {
          return res.status(500).json({ success: false, error: "Parser core layout extraction drop: " + scriptResult.error });
        }

        const documentTextLines = (scriptResult.payload || '').split('\n');
        
        const columnFieldsKeysList = [];
        const cleanDatabaseValuesArray = [];

        // ✅ PURE FLUID REFLECTION: Iterate entirely on current column models returned dynamically
        schemaCatalogDiscovery.rows.forEach(col => {
          const fieldName = col.column_name;
          const dbDataType = String(col.data_type).toLowerCase();

          columnFieldsKeysList.push(fieldName);
          
          let resolvedValueToken = null;
          const normalizedTargetKey = fieldName.toLowerCase().replace(/_/g, ' ').trim();

          // Search structural match combinations across layout text vectors
          for (let line of documentTextLines) {
            let cleanLine = line.toLowerCase().trim();
            if (cleanLine.includes(normalizedTargetKey)) {
              let valuesSegmentStr = line.replace(new RegExp(normalizedTargetKey, 'i'), '');
              let cleanToken = valuesSegmentStr.replace(/^[:\-|\s]+|[:\-|\s]+$/g, '').trim();
              
              if (cleanToken.includes('   ')) {
                cleanToken = cleanToken.split('   ')[0].trim();
              }

              if (cleanToken.length > 0) {
                resolvedValueToken = cleanToken;
                break;
              }
            }
          }

          // Enforce data type boundaries before committing to PostgreSQL columns
          if (dbDataType.includes('int') || dbDataType.includes('num') || dbDataType.includes('double') || dbDataType.includes('float')) {
            if (resolvedValueToken) {
              let numericCleanText = String(resolvedValueToken).replace(/[^0-9.]/g, '');
              let castFloat = parseFloat(numericCleanText);
              cleanDatabaseValuesArray.push(isNaN(castFloat) ? 0 : castFloat);
            } else {
              cleanDatabaseValuesArray.push(0);
            }
          } else {
            cleanDatabaseValuesArray.push(resolvedValueToken ? String(resolvedValueToken).substring(0, 255).trim() : null);
          }
        });

        // Map column parameters dynamically
        const fieldsClauseStr = columnFieldsKeysList.map(f => `"${f}"`).join(", ");
        const variablesClauseStr = columnFieldsKeysList.map((_, idx) => `$${idx + 1}`).join(", ");

        const parametricInsertSQLQuery = `INSERT INTO ${targetSpreadsheet} (${fieldsClauseStr}) VALUES (${variablesClauseStr}) RETURNING *`;
        const dbWriteResult = await pool.query(parametricInsertSQLQuery, cleanDatabaseValuesArray);
        
        console.log(`[DYNAMIC INGESTION SUCCESS] Perfectly saved data row inside table: ${targetSpreadsheet}`);

        return res.json({
          success: true,
          message: `Document processed fluidly and saved securely within active schema rows: ${targetSpreadsheet}`,
          insertedData: dbWriteResult.rows[0]
        });

      } catch (innerMappingError) {
        console.error("Dynamic database insertion fault caught:", innerMappingError.message);
        return res.status(500).json({ success: false, error: "Database mapping transaction entry aborted: " + innerMappingError.message });
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Pipeline processing intercept gate break: " + err.message });
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