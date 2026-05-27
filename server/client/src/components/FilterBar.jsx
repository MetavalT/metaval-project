import React from "react";

export default function FilterBar({ filterDate, setFilterDate, filterClient, setFilterClient, filterProduct, setFilterProduct }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
      <div>
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Filter By Execution Date</label>
        <input 
          type="date" 
          value={filterDate} 
          onChange={(e) => setFilterDate(e.target.value)} 
          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 shadow-sm" 
        />
      </div>
      <div>
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Search Client / Customer Name</label>
        <input 
          type="text" 
          placeholder="Type client keywords..." 
          value={filterClient} 
          onChange={(e) => setFilterClient(e.target.value)} 
          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 shadow-sm" 
        />
      </div>
      <div>
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Search Product Model / Assembly</label>
        <input 
          type="text" 
          placeholder="Type product name..." 
          value={filterProduct} 
          onChange={(e) => setFilterProduct(e.target.value)} 
          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 shadow-sm" 
        />
      </div>
    </div>
  );
}