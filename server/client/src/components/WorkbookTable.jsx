import React from "react";

export default function WorkbookTable({ workbookColumns, workbookRows, activeTable }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 text-gray-400 text-xs font-mono bg-gray-50 uppercase tracking-wider">
            {workbookColumns.map((colName) => (
              <th key={colName} className="py-3 px-4 white-space-nowrap">
                {colName === 'date' ? 'Date 📅' :
                 colName === 'client' ? 'Client Name 🏢' :
                 colName === 'product_name' ? 'Product Name 📦' :
                 colName === 'file_attachment' ? 'Original Document Data 📎' : colName.replace('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700 text-xs font-mono">
          {workbookRows.map((row, rIdx) => (
            <tr key={row.id || rIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
              {workbookColumns.map((colName) => (
                <td key={colName} className="py-4 px-4 max-w-xs truncate">
                  {colName === 'date' && row[colName]
                    ? new Date(row[colName]).toLocaleDateString()
                    : colName === 'file_attachment' && row[colName]
                    ? <div className="max-h-16 max-w-[260px] overflow-y-auto font-mono text-[10px] whitespace-pre-line bg-gray-900 text-green-400 p-2 rounded-xl shadow-inner border border-gray-800 leading-normal">
                        {String(row[colName])}
                      </div>
                    : typeof row[colName] === 'object' && row[colName] !== null 
                    ? JSON.stringify(row[colName]) 
                    : String(row[colName] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
          {workbookRows.length === 0 && (
            <tr>
              <td colSpan={workbookColumns.length || 1} className="text-center py-12 text-gray-400 font-sans">
                No matching records located inside worksheet target "{activeTable}".
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}