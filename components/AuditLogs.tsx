import React, { useState } from 'react';
import { AuditLog } from '../types';
import { Clock, ShieldAlert, Search } from 'lucide-react';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [query, setQuery] = useState('');
  
  const sortedAndFilteredLogs = [...logs]
    .filter(log => 
      log.action.toLowerCase().includes(query.toLowerCase()) || 
      log.details.toLowerCase().includes(query.toLowerCase()) ||
      log.userName?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-4 h-full overflow-y-auto pb-20 bg-gray-50 dark:bg-slate-950">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
          <ShieldAlert className="mr-3 text-brand-600" />
          Audit Logs
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" placeholder="Search activity..." value={query} 
            onChange={e => setQuery(e.target.value)} 
            className="pl-10 pr-4 py-2 rounded-xl border-2 border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-900 w-full md:w-64 outline-none focus:border-brand-500" 
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {sortedAndFilteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No activity matching your search was recorded.</td>
                </tr>
              ) : (
                sortedAndFilteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-slate-200">{log.userName || log.performedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 inline-flex text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 max-w-md truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;