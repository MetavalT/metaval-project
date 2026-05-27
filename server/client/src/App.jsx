import { useState, useEffect } from "react"
import API from "./api/axios"

import NotificationBell from "./components/NotificationBell"
import QueryForm from "./components/QueryForm"
import FilterBar from "./components/FilterBar"
import WorkbookTable from "./components/WorkbookTable"

function App() {
  const [backendStatus, setBackendStatus] = useState("Connecting...")
  const [stats, setStats] = useState([])
  const [queryData, setQueryData] = useState({ sender_name: "", sender_email: "", receiver_email: "", message: "" })
  const [sandboxResponse, setSandboxResponse] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  
  const [activeTable, setActiveTable] = useState("master_data")
  const [workbookRows, setWorkbookRows] = useState([])
  const [workbookColumns, setWorkbookColumns] = useState([]) 
  const [targetTableSelection, setTargetTableSelection] = useState("ofa_upload")

  const [filterDate, setFilterDate] = useState("")
  const [filterClient, setFilterClient] = useState("")
  const [filterProduct, setFilterProduct] = useState("")

  const [docsDone, setDocsDone] = useState(0)
  const [docsRecv, setDocsRecv] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [systemClock, setSystemClock] = useState(new Date().toLocaleString())

  const ALL_POSTGRES_TABLES = [
    'master_data', 'ofa_upload', 'pipe_material', 'plate_material', 'jackets',
    'bore_type', 'density_unit', 'dp_unit', 'flange_material', 'flange_schedule',
    'flange_type', 'flow_rate_unit', 'gasket', 'rj_holder_material', 'size_nps_dn',
    'studnut', 'tap_orientation', 'temp_unit', 'viscosity_unit', 'pressure_unit'
  ];

  useEffect(() => {
    fetchDashboardData()
    fetchWorkbookTable(activeTable)
  }, [activeTable, filterDate, filterClient, filterProduct])

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setSystemClock(new Date().toLocaleString())
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // ✅ Flat path relative to Axios baseURL prefix
      const response = await API.get("/dashboard")
      setStats(response.data.stats || [])
      setDocsDone(response.data.docsDone || 0)
      setDocsRecv(response.data.docsRecv || 0)
      setNotifications(response.data.records || [])
      setBackendStatus("Backend Connected Successfully")
    } catch (error) {
      setBackendStatus("Backend Connection Failed")
    }
  }

  const fetchWorkbookTable = async (tableName) => {
    try {
      // ✅ Flat path relative to Axios baseURL prefix
      const response = await API.get(`/workbook/${tableName}`, {
        params: {
          date: filterDate || undefined,
          client: filterClient || undefined,
          product_name: filterProduct || undefined
        }
      })
      
      let rawColumns = response.data.columns || []
      const coreKeysToReorder = ['date', 'client', 'product_name', 'file_attachment', 'id']
      let otherFactoryColumns = rawColumns.filter(col => !coreKeysToReorder.includes(col))
      let unifiedOrderedColumns = []
      
      if (rawColumns.includes('id')) unifiedOrderedColumns.push('id')
      if (rawColumns.includes('date')) unifiedOrderedColumns.push('date')
      if (rawColumns.includes('client')) unifiedOrderedColumns.push('client')
      if (rawColumns.includes('product_name')) unifiedOrderedColumns.push('product_name')
      if (rawColumns.includes('file_attachment')) unifiedOrderedColumns.push('file_attachment')
      
      unifiedOrderedColumns = [...unifiedOrderedColumns, ...otherFactoryColumns]
      setWorkbookRows(response.data.rows || [])
      setWorkbookColumns(unifiedOrderedColumns) 
    } catch (error) {
      console.error("Error loading workbook columns:", error)
    }
  }

  const clearActiveFilters = () => {
    setFilterDate("")
    setFilterClient("")
    setFilterProduct("")
  }

  const handleQuerySubmit = async (e) => {
    e.preventDefault()
    if (!queryData.sender_name || !queryData.sender_email || !queryData.receiver_email || !queryData.message) {
      return alert("Please fill in all internal office routing parameters (To, From, Name, and Message).");
    }

    try {
      // ✅ Flat path relative to Axios baseURL prefix
      await API.post("/query", queryData)
      alert(`Internal query routed successfully to office tracking systems!`)
      setQueryData({ sender_name: "", sender_email: "", receiver_email: "", message: "" })
      fetchDashboardData()
    } catch (error) {
      alert("Error dispatching request message: " + error.message)
    }
  }

  const handleModalUploadSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return alert("Select a PDF file first!")

    const formData = new FormData()
    formData.append("pdf", selectedFile)
    formData.append("target_table", targetTableSelection) 

    try {
      setIsExtracting(true)
      // ✅ Flat path relative to Axios baseURL prefix
      await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      alert(`Extraction successful! Data routed safely into Postgres table: ${targetTableSelection}`)
      setSelectedFile(null)
      setIsModalOpen(false)
      fetchDashboardData()
      fetchWorkbookTable(activeTable)
    } catch (error) {
      alert("Extraction Failure Check Dimensions Matrix")
    } finally {
      setIsExtracting(false)
    }
  }

  const successPercentage = docsRecv > 0 ? Math.round((docsDone / docsRecv) * 100) : 0;

  const buildFilteredDownloadUrl = () => {
    let url = `http://localhost:5000/api/data/export?table=${activeTable}`;
    if (filterDate) url += `&date=${filterDate}`;
    if (filterClient) url += `&client=${encodeURIComponent(filterClient)}`;
    if (filterProduct) url += `&product_name=${encodeURIComponent(filterProduct)}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 relative z-30">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Metaval AI Enterprise Dashboard</h1>
          <p className="text-gray-500 mt-1">Multi-Table Logistics Workbook & Parsing Pipeline</p>
          <p className="mt-2 text-sm text-green-600 font-medium">{backendStatus}</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell 
            notifications={notifications}
            isNotifOpen={isNotifOpen}
            setIsNotifOpen={setIsNotifOpen}
            fetchDashboardData={fetchDashboardData}
          />
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-md transition-all font-medium text-sm">
            📤 Route Manual PDF File
          </button>
          <a href={buildFilteredDownloadUrl()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all inline-block font-medium text-sm">
            📥 Export Filtered Excel Sheet
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-4 ${item.color}`}>{item.title}</div>
            <h2 className="text-4xl font-bold text-gray-800">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
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
          <QueryForm queryData={queryData} setQueryData={setQueryData} handleQuerySubmit={handleQuerySubmit} systemClock={systemClock} />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Active Postgres Worksheets</h2>
            <p className="text-xs text-gray-400 mt-1">Select an active table tab from your live Postgres schema view layout context below:</p>
          </div>
          <div className="space-y-1.5 my-3 max-h-64 overflow-y-auto pr-1">
            {ALL_POSTGRES_TABLES.map((t) => (
              <button key={t} onClick={() => setActiveTable(t)} className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all border ${activeTable === t ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                📁 Postgres Sheet: {t} {activeTable === t && " 🎯"}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <button 
              onClick={async () => {
                try {
                  setSandboxResponse("Pinging connection sandbox...");
                  const res = await API.post("/add", { name: "Bridge Check", email: "ping@local.io", age: 1 });
                  if (res.data.success) setSandboxResponse("Success! Sandbox connection functional.");
                } catch (err) {
                  setSandboxResponse("Connection Failed.");
                }
              }} 
              className="w-full bg-gray-800 hover:bg-gray-900 text-white text-xs p-2.5 rounded-xl font-medium shadow-sm transition-all"
            >
              🔌 Run Database Connection Ping
            </button>
            {sandboxResponse && <p className="mt-2 text-[10px] bg-gray-50 p-2 border rounded font-mono text-gray-500 break-all">{sandboxResponse}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dynamic Multi-Table Workbook Ledger Viewer</h2>
            <p className="text-xs text-gray-400 mt-0.5">Inspecting raw values from table: <span className="font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{activeTable}</span></p>
          </div>
          {(filterDate || filterClient || filterProduct) && (
            <button onClick={clearActiveFilters} className="text-xs text-red-600 bg-red-50 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm">
              ✕ Clear Active Search Filters
            </button>
          )}
        </div>
        <FilterBar filterDate={filterDate} setFilterDate={setFilterDate} filterClient={filterClient} setFilterClient={setFilterClient} filterProduct={filterProduct} setFilterProduct={setFilterProduct} />
        <WorkbookTable workbookColumns={workbookColumns} workbookRows={workbookRows} activeTable={activeTable} />
      </div>

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
                  {ALL_POSTGRES_TABLES.map(tName => <option key={tName} value={tName}>{tName}</option>)}
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