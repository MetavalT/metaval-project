# 🗺️ Project System Architecture Manifest & Safety Blueprint

This manifest maps the components of the Metaval project. It documents file boundaries, routing paths, and architectural vulnerabilities to enforce strict developer safeguards and eliminate technical clutter.

---

## 💻 1. Client-Side Workspace (React SPA Engine)

The frontend is a styled dashboard tracking real-time layout telemetry data and streaming administrative requests to the local server gateway.

### 📌 `client/src/App.jsx`
* **Primary Functionality:** Core state lifecycle manager for the user interface. Coordinates modal toggles, table selection switches, background data extraction alerts, and global clock intervals.
* **Behavioral Rules:** Runs synchronous `useEffect` intervals to handle background layout metrics checks.
* [cite_start]**🚨 Safety Safeguard Alert:** When validating query dispatch updates via `handleQuerySubmit`, it must map to the original user input structure parameters (`queryData.name`, `queryData.email`, `queryData.message`)[cite: 71, 72]. Changing these fields without syncing your inline form properties (`QueryForm.jsx`) will throw layout blocking dialogues.

### 📌 `client/src/api/axios.js`
* **Primary Functionality:** Central HTTP client instantiation. Employs a flat connection base URL targeting the local server port.
* **Network Mapping Mapping Rules:** ```javascript
    baseURL: "http://localhost:5000"
    ```
* **🚨 Safety Safeguard Alert:** Do **NOT** append path folders like `/api` or `/api/data` inside this baseline client configuration file. Doing so while passing manual paths from your files will cause route duplications and trigger immediate `404 Not Found` network crashes.

### 📌 `client/src/components/WorkbookTable.jsx`
* **Primary Functionality:** High-performance tabular datagrid ledger viewer. Renders column variables dynamically based on table catalogs polled directly from the live database schema.

### 📌 `client/src/components/NotificationBell.jsx`
* **Primary Functionality:** Dropdown interactive UI alert manager. Listens for incoming system admin tickets and handles real-time response inputs.

---

## 🛢️ 2. Backend Gateway Core (Node.js & Express API Server)

The application engine exposes endpoints that match front-end requests, discover database shapes dynamically, and call parsing binaries.

### 📌 `server/app.js`
* **Primary Functionality:** Primary server entry point configuration loader. Initializes global CORS permissions, activates JSON serialization hooks, and mounts your primary application route modules under a unified folder prefix.
* **Middleware Route Map Rule:**
    ```javascript
    app.use('/api/data', dataRoutes);
    ```

### 📌 `server/routes/dataRoutes.js`
* **Primary Functionality:** Centralized route mapper. Matches frontend Axios client calls directly to your `dataController` methods using clean endpoints.
* **Active Route Maps:**
    * `GET /dashboard` ➔ `getDashboardData`
    * `POST /upload` ➔ `uploadPDF`
    * `GET /workbook/:tableName` ➔ `getWorkbookTableData`
    * `POST /query` ➔ `submitQuery`
    * `POST /reply` ➔ `replyQuery`
    * `GET /export` ➔ `exportExcel`

### 📌 `server/controllers/dataController.js`
* **Primary Functionality:** Core execution logic hub. Reads incoming payloads, inspects active database constraints dynamically, and commits parameters safely to your relational ledger tables.
* **🚨 Safety Safeguard Alert (Response Duplication Bug):** If you execute local sub-process routines inside your controllers (like spawning background scripts), you must explicitly run single `return res.json(...)` blocks inside your callbacks. Attempting to pass error text blocks followed by trailing fallback streams will throw an unhandled `ERR_HTTP_HEADERS_SENT` server crash.

### 📌 `server/config/db.js`
* **Primary Functionality:** PostgreSQL client connection allocator. Pools credentials and manages high-concurrency transactional pipelines.

---

## 🔬 3. Independent Modular Core Services

Isolated procedural utilities that handle file conversion, file writing, and string positioning matching scripts.

### 📌 `server/services/pdfService.js`
* **Primary Functionality:** Primary document text ingestion. Leverages layout parsers (`pdf-parse`) to convert selectable digital character strings into readable text vectors.

### 📌 `server/services/strategyMatcher.js`
* **Primary Functionality:** Heuristic structural position layout matching. Maps loose text elements into correct database cells based on row index coordinates.

### 📌 `server/services/excelService.js`
* **Primary Functionality:** Data download generation layer. Converts raw arrays straight into structured Excel sheets, avoiding unstable CSV modifications.

---

## 🚫 Critical Code of Conduct Safeguards (How to Prevent Disasters)

1.  [cite_start]**Never Hard-Bind Database Schemas:** Your worksheets are highly dynamic (over 129 columns for tables like `ofa_upload`)[cite: 462]. Your code must always run dynamic lookups against `information_schema.columns` to find active layout shapes rather than using static indices or hard-coded insertion strings[cite: 466].
2.  [cite_start]**Protect the Event Loop on Large Files:** In the future, as you scale toward processing 500-page logistics sheets, processing heavy visual calculations synchronously inside the main API execution thread will freeze your server[cite: 796]. [cite_start]Long-running document processes should be handled asynchronously via a background task framework[cite: 855].
3.  **Validate Data Types Prior to Query Execution:** If a string parser pulls text context (like `"To be confirmed by vendor data"`) and tries to push it into a strict PostgreSQL `NUMERIC` table cell, the engine will drop the query. Enforce string filtering layers in your controller to keep your columns safe.