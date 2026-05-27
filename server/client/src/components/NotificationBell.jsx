import React, { useState } from "react";
import API from "../api/axios";

export default function NotificationBell({ notifications, isNotifOpen, setIsNotifOpen, fetchDashboardData }) {
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const submitInlineReply = async (queryId) => {
    if (!replyText.trim()) return alert("Write a response before sending!");
    try {
      // ✅ Flat path relative to Axios baseURL prefix
      const response = await API.post("/reply", { queryId, reply_text: replyText });
      if (response.data.success) {
        alert("Reply submitted successfully. Alert cleared.");
        setReplyText("");
        setActiveReplyId(null);
        fetchDashboardData();
      }
    } catch (error) {
      alert("Error dispatching response message.");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsNotifOpen(!isNotifOpen)} 
        className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-xl shadow-md transition-all text-xl relative border border-gray-200 flex items-center gap-2 font-medium"
      >
        <span>Notifications</span> 🔔
        {notifications.length > 0 && (
          <span className="bg-red-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>
      
      {isNotifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Live Mail & Query Alerts</h4>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{notifications.length} Active</span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {notifications.map((notifObj) => (
              <div key={notifObj.id} className="text-[11px] bg-gray-50 p-3 border border-gray-100 rounded-xl text-gray-600 shadow-inner flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-[9px] text-blue-500 font-bold border-b border-gray-200 pb-1">
                  <span>From: {notifObj.sender_email}</span>
                  <span>To: {notifObj.receiver_email}</span>
                </div>
                <p className="font-sans font-medium text-gray-800 leading-normal">
                  <span className="font-bold text-gray-400">Msg:</span> "{notifObj.message}"
                </p>
                
                {activeReplyId === notifObj.id ? (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-dashed border-gray-200">
                    <input 
                      type="text" 
                      placeholder="Type your reply message..." 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)} 
                      className="w-full border rounded-lg p-1.5 text-xs outline-none bg-white focus:ring-1 focus:ring-blue-400"
                    />
                    <div className="flex justify-end gap-1.5 text-[10px]">
                      <button onClick={() => setActiveReplyId(null)} className="text-gray-400 hover:underline px-2">Cancel</button>
                      <button onClick={() => submitInlineReply(notifObj.id)} className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-md shadow-sm">Send 🚀</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mt-1">
                    <button onClick={() => setActiveReplyId(notifObj.id)} className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold px-2 py-1 rounded-md transition-all shadow-sm">
                      ↩️ Reply to Query
                    </button>
                  </div>
                )}
              </div>
            ))}
            {notifications.length === 0 && <p className="text-xs text-gray-400 text-center py-6">All clear! No pending mail items.</p>}
          </div>
        </div>
      )}
    </div>
  );
}