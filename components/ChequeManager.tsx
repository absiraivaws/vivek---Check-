import React, { useState, useMemo, useEffect } from 'react';
import { Collection, CollectionStatus, PaymentType, Customer, Route, GlobalSettings } from '../types';
import { Calendar, ArrowUpDown, Landmark, ChevronUp, ChevronDown, Search, User, MapPin, Trash2, CheckSquare, Square } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { formatAmount, formatFullAmount } from '../App';

interface ChequeManagerProps {
  collections: Collection[];
  settings: GlobalSettings;
}

type SortKey = 'status' | 'cheque_number' | 'bank' | 'realize_date' | 'amount' | 'customer_name';

const ChequeManager: React.FC<ChequeManagerProps> = ({ collections, settings }) => {
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT_READY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('realize_date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    onSnapshot(collection(db, 'customers'), s => setCustomers(s.docs.map(d => ({ ...d.data(), customer_id: d.id } as Customer))));
    onSnapshot(collection(db, 'routes'), s => setRoutes(s.docs.map(d => ({ ...d.data(), route_id: d.id } as Route))));
  }, []);

  const filteredCheques = useMemo(() => {
    let base = collections.filter(c => c.payment_type === PaymentType.CHEQUE);
    if (filter === 'DEPOSIT_READY') base = base.filter(c => c.status === CollectionStatus.PENDING);
    
    return base.filter(c => {
      const cust = customers.find(cu => cu.customer_id === c.customer_id);
      const searchStr = `${c.cheque_number} ${c.bank} ${cust?.business_name || ''}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    }).sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortKey === 'customer_name') {
        valA = customers.find(cu => cu.customer_id === a.customer_id)?.business_name || '';
        valB = customers.find(cu => cu.customer_id === b.customer_id)?.business_name || '';
      } else {
        valA = a[sortKey as keyof Collection] || '';
        valB = b[sortKey as keyof Collection] || '';
      }
      
      return sortOrder === 'ASC' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
  }, [collections, filter, searchQuery, sortKey, sortOrder, customers]);

  const totalFiltered = useMemo(() => filteredCheques.reduce((s, c) => s + c.amount, 0), [filteredCheques]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    else { setSortKey(key); setSortOrder('ASC'); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCheques.length && filteredCheques.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCheques.map(c => c.collection_id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} cheque(s)?`)) return;

    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.delete(doc(db, 'collections', id));
      });
      await batch.commit();
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSingle = async (id: string, chequeNo: string) => {
    if (!confirm(`Are you sure you want to delete cheque "${chequeNo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'collections', id));
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
    } catch (e) {
      console.error(e);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="ml-1 opacity-40" />;
    return sortOrder === 'ASC' ? <ChevronUp size={12} className="ml-1 text-brand-600" /> : <ChevronDown size={12} className="ml-1 text-brand-600" />;
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-slate-100">Cheque Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Filtered Total: <span className="font-bold text-brand-600">{formatAmount(totalFiltered, settings.currency_code)}</span> ({filteredCheques.length} Cheques)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDeleteSelected} 
            disabled={selectedIds.size === 0}
            className={`flex items-center px-4 py-2 border rounded-xl font-bold transition-all text-xs ${selectedIds.size > 0 ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
          >
            <Trash2 size={14} className="mr-2" /> Delete ({selectedIds.size})
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" placeholder="Search cheques..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border-2 border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
          <div className="flex p-1 bg-brand-100 dark:bg-slate-800 rounded-xl">
             <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 text-xs font-bold rounded-lg ${filter === 'ALL' ? 'bg-brand-500 text-white shadow-sm' : 'text-brand-700 dark:text-slate-300'}`}>All</button>
             <button onClick={() => setFilter('DEPOSIT_READY')} className={`px-4 py-1.5 text-xs font-bold rounded-lg ${filter === 'DEPOSIT_READY' ? 'bg-brand-500 text-white shadow-sm' : 'text-brand-700 dark:text-slate-300'}`}>To Deposit</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto divide-y divide-brand-50 dark:divide-slate-800">
            <thead className="bg-brand-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-brand-500">
                    {selectedIds.size > 0 && selectedIds.size === filteredCheques.length ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th onClick={() => toggleSort('status')} className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase cursor-pointer">Status <SortIcon col="status" /></th>
                <th onClick={() => toggleSort('cheque_number')} className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase cursor-pointer">Cheque Info <SortIcon col="cheque_number" /></th>
                <th onClick={() => toggleSort('customer_name')} className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase cursor-pointer">Customer / Route <SortIcon col="customer_name" /></th>
                <th onClick={() => toggleSort('realize_date')} className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase cursor-pointer">Date <SortIcon col="realize_date" /></th>
                <th onClick={() => toggleSort('amount')} className="px-6 py-4 text-right text-xs font-bold text-brand-700 dark:text-slate-400 uppercase cursor-pointer">Amount <SortIcon col="amount" /></th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50 dark:divide-slate-800">
              {filteredCheques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brand-400 italic">No cheques found.</td>
                </tr>
              ) : (
                filteredCheques.map(c => {
                  const cust = customers.find(cu => cu.customer_id === c.customer_id);
                  const route = routes.find(r => r.route_id === cust?.route_id);
                  return (
                    <tr key={c.collection_id} className={`hover:bg-brand-50/30 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.has(c.collection_id) ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleSelect(c.collection_id)} className="text-brand-500">
                          {selectedIds.has(c.collection_id) ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                          c.status === 'Realized' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          c.status === 'Returned' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold dark:text-slate-200">{c.cheque_number}</div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate max-w-[150px]">{c.bank}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs font-medium dark:text-slate-300"><User size={12} className="mr-1 text-brand-400"/> {cust?.business_name || 'N/A'}</div>
                        <div className="flex items-center text-[10px] text-gray-400"><MapPin size={10} className="mr-1"/> {route?.route_name || 'No Route'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-brand-600 dark:text-brand-400 font-bold">{c.realize_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold dark:text-slate-100 font-mono">{formatFullAmount(c.amount, settings.currency_code)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button onClick={() => handleDeleteSingle(c.collection_id, c.cheque_number || 'Unnamed')} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChequeManager;