import { useState, useEffect } from "react"
import API from "./api/axios"

function App() {
  const [backendStatus, setBackendStatus] = useState("Connecting...")
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState([])
  const [queryData, setQueryData] = useState({ name: "", email: "", message: "" })

  // Modal Control Intercept States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  
  // LIVE WORKBOOK SHEET SWITCH STATES: All 21 valid Postgres sheets
  const [activeTable, setActiveTable] = useState("master_data")
  const [workbookRows, setWorkbookRows] = useState([])
  const [workbookColumns, setWorkbookColumns] = useState([]) // Holds actual table columns from DB
  const [targetTableSelection, setTargetTableSelection] = useState("master_data")

  // SUCCESS RATIO METRICS STATES
  const [docsDone, setDocsDone] = useState(0)
  const [docsRecv, setDocsRecv] = useState(0)

  // Isolated Sandbox Tester Elements
  const [sandboxResponse, setSandboxResponse] = useState("")

  const ALL_POSTGRES_TABLES = [
    'master_data', 'ofa_upload', 'pipe_material', 'plate_material', 'jackets',
    'bore_type', 'density_unit', 'dp_unit', 'flange_material', 'flange_schedule',
    'flange_type', 'flow_rate_unit', 'gasket', 'rj_holder_material', 'size_nps_dn',
    'studnut', 'tap_orientation', 'temp_unit', 'viscosity_unit', 'pressure_unit'
  ];

  useEffect(() => {
    fetchDashboardData()
    fetchWorkbookTable(activeTable)
  }, [activeTable])

  const fetchDashboardData = async () => {
    try {
      const response = await API.get("/api/data/dashboard")
      setStats(response.data.stats || [])
      setRecords(response.data.records || [])
      setDocsDone(response.data.docsDone || 0)
      setDocsRecv(response.data.docsRecv || 0)
      setBackendStatus("Backend Connected Successfully")
    } catch (error) {
      setBackendStatus("Backend Connection Failed")
    }
  }

  const fetchWorkbookTable = async (tableName) => {
    try {
      const response = await API.get(`/api/data/workbook/${tableName}`)
      setWorkbookRows(response.data.rows || [])
      setWorkbookColumns(response.data.columns || []) // Stores your actual table headers programmatically
    } catch (error) {
      console.log("Error loading workbook columns:", error)
    }
  }

  const handleQuerySubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post("/api/data/query", queryData)
      alert("Query Submitted Successfully!")
      setQueryData({ name: "", email: "", message: "" })
    } catch (error) {
      alert("Error submitting query")
    }
  }

  const handleModalUploadSubmit = async (e) => {
    // ⚠️ FIX 1: Prevents form redirection to a white blank screen!
    e.preventDefault()
    if (!selectedFile) return alert("Select a PDF file first!")

    const formData = new FormData()
    formData.append("pdf", selectedFile)
    formData.append("target_table", targetTableSelection) 

    try {
      setIsExtracting(true)
      const response = await API.post("/api/data/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.data.success) {
        alert(`Extraction successful! Data routed safely into Postgres table: ${targetTableSelection}`)
        setSelectedFile(null)
        setIsModalOpen(false)
        fetchDashboardData()
        fetchWorkbookTable(activeTable)
      }
    } catch (error) {
      alert("Extraction Failure")
    } finally {
      setIsExtracting(false)
    }
  }

  const triggerSandboxBridgeCheck = async () => {
    try {
      setSandboxResponse("Pinging connection sandbox...")
      const res = await API.post("/api/data/add", { name: "Bridge Check", email: "ping@local.io", age: 1 })
      if (res.data.success) setSandboxResponse("Success! Sandbox 'records' table holds connection row.")
    } catch (err) {
      setSandboxResponse("Connection Failed.")
    }
  }

  const successPercentage = docsRecv > 0 ? Math.round((docsDone / docsRecv) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Metaval AI Enterprise Dashboard</h1>
          <p className="text-gray-500 mt-1">Multi-Table Logistics Workbook & Parsing Pipeline</p>
          <p className="mt-2 text-sm text-green-600 font-medium">{backendStatus}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-md transition-all font-medium">
            📤 Route Manual PDF File
          </button>
          <a
            href={`http://localhost:5000/api/data/export?table=${activeTable}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all inline-block font-medium"
          >
            📥 Export Sheet Data
          </a>
        </div>
      </div>

      {/* RESTORED original KPI counters layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-md">
            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-4 ${item.color}`}>{item.title}</div>
            <h2 className="text-4xl font-bold text-gray-800">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* DYNAMIC PROGRESSION GRID ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* SUCCESS EFFICIENCY BAR */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase">System Extraction Performance Success Ratio</h3>
                <p className="text-xl font-extrabold text-gray-800 mt-0.5">Documents Processed Successfully / Total Items Received</p>
              </div>
              <span className="text-2xl font-black text-green-600 bg-green-50 px-3 py-1 rounded-xl">{successPercentage}% Efficiency</span>
            </div>
            <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden relative shadow-inner mt-4">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-3" style={{ width: `${successPercentage}%` }}>
                <span className="text-[10px] font-black text-white">{docsDone}/{docsRecv} Done</span>
              </div>
            </div>
          </div>

          {/* QUERY CONTROL PANEL FORM */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Query Form</h2>
            <form onSubmit={handleQuerySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Enter your name" value={queryData.name} onChange={(e) => setQueryData({ ...queryData, name: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="email" placeholder="Enter your email" value={queryData.email} onChange={(e) => setQueryData({ ...queryData, email: e.target.value })} className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <textarea rows="4" placeholder="Write your query context here..." value={queryData.message} onChange={(e) => setQueryData({ ...queryData, message: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all font-medium">Submit Query</button>
            </form>
          </div>
        </div>

        {/* WORKBOOK MANAGEMENT SIDE TAB CONTROLS PANEL */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Active Postgres Worksheets</h2>
            <p className="text-xs text-gray-400 mt-1">Select an active table tab from your live Postgres schema view layout context below:</p>
          </div>
          <div className="space-y-1.5 my-3 max-h-60 overflow-y-auto pr-1">
            {ALL_POSTGRES_TABLES.map((t) => (
              <button key={t} onClick={() => setActiveTable(t)} className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${activeTable === t ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                📁 Postgres Sheet: {t} {activeTable === t && " 🎯"}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100">
            <button onClick={triggerSandboxBridgeCheck} className="w-full bg-gray-800 hover:bg-gray-900 text-white text-xs p-2.5 rounded-xl font-medium">🔌 Run Database Connection Ping</button>
            {sandboxResponse && <p className="mt-2 text-[10px] bg-gray-50 p-2 border rounded font-mono text-gray-500">{sandboxResponse}</p>}
          </div>
        </div>
      </div>

      {/* DYNAMIC WORKBOOK GRID BROWSER VIEW (REAL POSTGRES HEADERS) */}
      <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Dynamic Multi-Table Workbook Ledger Viewer</h2>
          <p className="text-xs text-gray-400 mt-0.5">Inspecting raw values from table: <span className="font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{activeTable}</span></p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 text-xs font-mono tracking-wider bg-gray-50">
              {/* ⚠️ FIX 2: Dynamic headers generated programmatically from real database table columns! */}
              {workbookColumns.map((colName) => (
                <th key={colName} className="py-3 px-4 uppercase">{colName.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700 text-xs font-mono">
            {workbookRows.map((row, rIdx) => (
              <tr key={row.id || rIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                {workbookColumns.map((colName) => (
                  <td key={colName} className="py-4 px-4 max-w-xs truncate">
                    {/* Render standard variables or nested parameters string structures cleanly */}
                    {typeof row[colName] === 'object' && row[colName] !== null 
                      ? JSON.stringify(row[colName]) 
                      : String(row[colName] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
            {workbookRows.length === 0 && (
              <tr><td colSpan={workbookColumns.length || 1} className="text-center py-12 text-gray-400 font-sans">No data records found inside layout table target "{activeTable}".</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MANUAL UPLOAD DIALOG MODAL BOX */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800">Manual Ingestion Router</h3>
              <button onClick={() => { if(!isExtracting) setIsModalOpen(false) }} className="text-gray-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleModalUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase">Select Target Sheet Destination:</label>
                <select value={targetTableSelection} onChange={(e) => setTargetTableSelection(e.target.value)} disabled={isExtracting} className="w-full border p-3 rounded-xl outline-none text-xs font-mono font-bold text-gray-700 bg-gray-50">
                  {ALL_POSTGRES_TABLES.map(tName => (
                    <option key={tName} value={tName}>{tName}</option>
                  ))}
                </select>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50">
                <input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} disabled={isExtracting} className="w-full text-xs text-gray-500 cursor-pointer" />
              </div>
              {selectedFile && <div className="bg-blue-50 border text-blue-800 text-xs p-2 rounded-xl truncate">📄 {selectedFile.name}</div>}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isExtracting} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                <button type="submit" disabled={isExtracting || !selectedFile} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md">
                  {isExtracting ? "Model Processing..." : "Run AI Ingestion Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App