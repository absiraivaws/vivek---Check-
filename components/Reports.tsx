import React, { useState, useMemo, useRef } from 'react';
import { Collection, Customer, Route, CollectionStatus, GlobalSettings } from '../types';
import { Download, Search, Calendar, MapPin, ArrowUpDown } from 'lucide-react';
import { formatAmount, formatFullAmount } from '../App';

interface ReportsProps {
  collections: Collection[];
  customers: Customer[];
  routes: Route[];
  settings: GlobalSettings;
}

type SortOrder = 'A-Z' | 'Z-A' | 'NONE';

const Reports: React.FC<ReportsProps> = ({ collections, customers, routes, settings }) => {
  const [activeReport, setActiveReport] = useState('DAILY_COLLECTION');
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('NONE');

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const handleDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          ref.current.showPicker();
        } else {
          ref.current.focus();
        }
      } catch (e) {
        ref.current.focus();
      }
    }
  };

  const filteredData = useMemo(() => {
    let base = [...collections];
    if (activeReport === 'PENDING_CHEQUES') base = base.filter(c => c.status === CollectionStatus.PENDING);
    if (activeReport === 'RETURNED_CHEQUES') base = base.filter(c => c.status === CollectionStatus.RETURNED);

    let result = base.filter(c => {
      const cust = customers.find(cu => cu.customer_id === c.customer_id);
      const bizName = cust?.business_name || '';
      const matchesSearch = bizName.toLowerCase().includes(searchQuery.toLowerCase()) || (c.cheque_number && c.cheque_number.includes(searchQuery));
      const matchesRoute = routeFilter === 'ALL' || cust?.route_id === routeFilter;
      const matchesDate = (!dateFrom || c.collection_date >= dateFrom) && (!dateTo || c.collection_date <= dateTo);
      return matchesSearch && matchesRoute && matchesDate;
    });

    if (sortOrder === 'A-Z') {
      result.sort((a, b) => {
        const nameA = customers.find(c => c.customer_id === a.customer_id)?.business_name || '';
        const nameB = customers.find(c => c.customer_id === b.customer_id)?.business_name || '';
        return nameA.localeCompare(nameB);
      });
    } else if (sortOrder === 'Z-A') {
      result.sort((a, b) => {
        const nameA = customers.find(c => c.customer_id === a.customer_id)?.business_name || '';
        const nameB = customers.find(c => c.customer_id === b.customer_id)?.business_name || '';
        return nameB.localeCompare(nameA);
      });
    }

    return result;
  }, [collections, searchQuery, activeReport, customers, routeFilter, dateFrom, dateTo, sortOrder]);

  const stats = useMemo(() => {
    const total = filteredData.reduce((s, c) => s + c.amount, 0);
    return { count: filteredData.length, total };
  }, [filteredData]);

  const toggleSort = () => {
    if (sortOrder === 'NONE') setSortOrder('A-Z');
    else if (sortOrder === 'A-Z') setSortOrder('Z-A');
    else setSortOrder('NONE');
  };

  return (
    <div className="p-4 h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-slate-100">Financial Reports</h1>
          <p className="text-sm text-gray-500">View and export collection data</p>
        </div>
        <div className="text-right">
           <div className="text-xs font-bold text-brand-500 uppercase">Filtered Total</div>
           <div className="text-xl font-extrabold text-brand-800 dark:text-brand-400">{formatAmount(stats.total, settings.currency_code)}</div>
           <div className="text-[10px] text-gray-400">{stats.count} transactions</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Report View</label>
            <select value={activeReport} onChange={e => setActiveReport(e.target.value)} className="w-full p-2 text-sm rounded-xl border bg-brand-50 dark:bg-slate-800 dark:text-slate-100 outline-none">
              <option value="DAILY_COLLECTION">Daily Collection</option>
              <option value="PENDING_CHEQUES">Pending Cheques</option>
              <option value="RETURNED_CHEQUES">Returned Cheques</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Route Filter</label>
            <select value={routeFilter} onChange={e => setRouteFilter(e.target.value)} className="w-full p-2 text-sm rounded-xl border bg-brand-50 dark:bg-slate-800 dark:text-slate-100 outline-none">
              <option value="ALL">All Routes</option>
              {routes.map(r => <option key={r.route_id} value={r.route_id}>{r.route_name}</option>)}
            </select>
          </div>
          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date Range</label>
            <div className="flex gap-2">
              <div className="relative flex-1 cursor-pointer" onClick={() => handleDatePicker(dateFromRef)}>
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                <input 
                  ref={dateFromRef} 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                  className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border bg-brand-50 dark:bg-slate-800 dark:text-slate-100 cursor-pointer" 
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="relative flex-1 cursor-pointer" onClick={() => handleDatePicker(dateToRef)}>
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                <input 
                  ref={dateToRef} 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                  className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border bg-brand-50 dark:bg-slate-800 dark:text-slate-100 cursor-pointer" 
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
            <input 
              type="text" placeholder="Search by customer or cheque number..." value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-brand-50 dark:bg-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
          <button className="flex items-center justify-center bg-brand-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand-700 transition-all"><Download size={16} className="mr-2" /> Export PDF</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-brand-100 dark:border-slate-800">
        <table className="min-w-full divide-y divide-brand-100 dark:divide-slate-800">
          <thead className="bg-brand-50/50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Date</th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase cursor-pointer flex items-center gap-1 group"
                onClick={toggleSort}
              >
                Customer / Route 
                <ArrowUpDown size={12} className={`transition-opacity ${sortOrder === 'NONE' ? 'opacity-30 group-hover:opacity-100' : 'opacity-100'}`} />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Payment</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50 dark:divide-slate-800">
            {filteredData.map(c => {
              const cust = customers.find(cu => cu.customer_id === c.customer_id);
              const route = routes.find(r => r.route_id === cust?.route_id);
              return (
                <tr key={c.collection_id} className="hover:bg-brand-50 dark:hover:bg-slate-800 border-b dark:border-slate-800 last:border-0">
                  <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">{c.collection_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold dark:text-slate-100">{cust?.business_name || 'N/A'}</div>
                    <div className="text-[10px] text-gray-400 flex items-center"><MapPin size={8} className="mr-1"/> {route?.route_name || 'No Route'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400">{c.payment_type}</td>
                  <td className="px-6 py-4 text-sm text-brand-900 dark:text-brand-400 text-right font-extrabold font-mono">{formatFullAmount(c.amount, settings.currency_code)}</td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No matching records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;