import React, { useState } from 'react';
import { Collection, CollectionStatus, PaymentType } from '../types';
import { Calendar, CheckCircle, ArrowUpDown, Landmark } from 'lucide-react';

interface ChequeManagerProps {
  collections: Collection[];
}

const ChequeManager: React.FC<ChequeManagerProps> = ({ collections }) => {
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT_READY'>('ALL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Filter only cheques
  let cheques = collections.filter(c => c.payment_type === PaymentType.CHEQUE);

  // Apply Deposit Ready Filter (Pending & Nearest date logic simplified to pending for demo)
  if (filter === 'DEPOSIT_READY') {
    cheques = cheques.filter(c => c.status === CollectionStatus.PENDING);
  }

  // Sort
  cheques.sort((a, b) => {
    const dateA = new Date(a.realize_date || '').getTime();
    const dateB = new Date(b.realize_date || '').getTime();
    return sortOrder === 'ASC' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Cheque Management</h1>
        <div className="flex space-x-2">
           <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-sm rounded-md ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-700'}`}
          >
            All Cheques
          </button>
          <button
            onClick={() => setFilter('DEPOSIT_READY')}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${filter === 'DEPOSIT_READY' ? 'bg-brand-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            <Landmark size={14} className="mr-1" />
            Bank Deposit
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowUpDown size={14} className="mr-1" />
          Sort by Date ({sortOrder})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank/Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realize Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cheques.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No cheques found.</td>
                </tr>
              ) : (
                cheques.map((c) => (
                  <tr key={c.collection_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${c.status === CollectionStatus.RECEIVED || c.status === CollectionStatus.REALIZED ? 'bg-green-100 text-green-800' : 
                          c.status === CollectionStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.cheque_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.bank} - {c.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        <div className="flex items-center">
                            <Calendar size={14} className="mr-2 text-gray-400" />
                            {c.realize_date}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                      ${c.amount.toFixed(2)}
                    </td>
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

export default ChequeManager;
