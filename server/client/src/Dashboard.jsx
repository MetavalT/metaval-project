export default function Dashboard() {
  const stats = [
    {
      title: 'Total PDF Uploaded',
      value: '128',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Mails Reverted Back',
      value: '42',
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Pending Responses',
      value: '5',
      color: 'bg-red-100 text-red-700',
    },
    {
      title: 'Daily Updates',
      value: '16',
      color: 'bg-yellow-100 text-yellow-700',
    },
  ]

  const records = [
    {
      id: 1,
      type: 'PDF',
      name: 'Invoice_Report.pdf',
      date: '19 May 2026',
    },
    {
      id: 2,
      type: 'Text',
      name: 'User Feedback',
      date: '19 May 2026',
    },
    {
      id: 3,
      type: 'PDF',
      name: 'Client_Details.pdf',
      date: '18 May 2026',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            User Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            PDF, Mail & Query Management System
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all duration-300">
          Download Excel Sheet
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div
              className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-4 ${item.color}`}
            >
              {item.title}
            </div>

            <h2 className="text-4xl font-bold text-gray-800">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upload PDF */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload PDF Manually
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <input type="file" accept="application/pdf" />

            <p className="text-gray-500 mt-4">
              Upload PDF files manually
            </p>
          </div>

          <button className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all duration-300">
            Submit PDF
          </button>
        </div>

        {/* Query Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            User Query Form
          </h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <textarea
              rows="5"
              placeholder="Write your query here..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition-all duration-300"
            >
              Submit Query
            </button>
          </form>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Text & PDF Records
          </h2>

          <div className="flex gap-3">
            <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-all duration-300">
              Text Data
            </button>

            <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-all duration-300">
              PDF Data
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">File / Data Name</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">{record.id}</td>
                <td className="py-4 px-4">{record.type}</td>
                <td className="py-4 px-4">{record.name}</td>
                <td className="py-4 px-4">{record.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notification Section */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          Notifications
        </h2>

        <ul className="space-y-2 text-red-600">
          <li>• 5 mails are pending response.</li>
          <li>• 2 PDFs require verification.</li>
          <li>• Daily report has been updated.</li>
        </ul>
      </div>
    </div>
  )
}
