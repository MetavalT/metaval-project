import React from "react";

export default function QueryForm({ queryData, setQueryData, handleQuerySubmit, systemClock }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Office Communications Routing Portal</h2>
      
      <div className="mb-4 bg-blue-50 text-blue-700 font-mono text-xs p-2.5 rounded-xl border border-blue-100 inline-flex items-center gap-2 font-bold">
        ⏱️ Automated System Timeline Sync: <span className="bg-white px-2 py-0.5 rounded shadow-sm text-gray-800">{systemClock}</span>
      </div>

      <form onSubmit={handleQuerySubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            value={queryData.sender_name || ""} 
            onChange={(e) => setQueryData({ ...queryData, sender_name: e.target.value })} 
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 text-sm" 
          />
          <input 
            type="email" 
            placeholder="From (Your Email)" 
            value={queryData.sender_email || ""} 
            onChange={(e) => setQueryData({ ...queryData, sender_email: e.target.value })} 
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 text-sm" 
          />
          <input 
            type="email" 
            placeholder="To (Recipient Employee Email)" 
            value={queryData.receiver_email || ""} 
            onChange={(e) => setQueryData({ ...queryData, receiver_email: e.target.value })} 
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 text-sm" 
          />
        </div>
        <textarea 
          rows="3" 
          placeholder="Write your internal office query context or notes here..." 
          value={queryData.message || ""} 
          onChange={(e) => setQueryData({ ...queryData, message: e.target.value })} 
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 text-sm" 
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-all font-medium text-sm shadow-sm">
          Dispatch Internal Query
        </button>
      </form>
    </div>
  );
}