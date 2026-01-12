import React, { useState } from 'react';
import { Collection, CollectionStatus, PaymentType, BankStatementEntry } from '../types';
import { Upload, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';

interface ReconciliationProps {
  collections: Collection[];
  onReconcile: (collectionIds: string[], status: CollectionStatus) => void;
}

const Reconciliation: React.FC<ReconciliationProps> = ({ collections, onReconcile }) => {
  const [statementData, setStatementData] = useState<BankStatementEntry[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [matchedItems, setMatchedItems] = useState<{collection: Collection, entry: BankStatementEntry}[]>([]);
  const [unmatchedCollections, setUnmatchedCollections] = useState<Collection[]>([]);

  // Simulate parsing a CSV/Excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo purposes, we will mock the statement data based on existing collections to ensure some matches
      // In a real app, we would parse the file content here.
      const mockStatement: BankStatementEntry[] = [
         // Mock a cleared cheque from existing data
         ...collections.filter(c => c.payment_type === PaymentType.CHEQUE && c.status === CollectionStatus.PENDING).slice(0, 1).map(c => ({
             id: `ST-${Math.random()}`,
             date: c.realize_date || '2023-01-01',
             cheque_number: c.cheque_number || '',
             amount: c.amount,
             status: 'CLEARED' as const
         })),
         // Mock a returned cheque
         { id: 'ST-999', date: '2023-10-27', cheque_number: 'INVALID001', amount: 5000, status: 'RETURNED' }
      ];
      setStatementData(mockStatement);
    }
  };

  const runAutoReconciliation = () => {
    const matches: {collection: Collection, entry: BankStatementEntry}[] = [];
    const unmatched: Collection[] = [];
    
    // Get all pending cheques
    const pendingCheques = collections.filter(c => c.payment_type === PaymentType.CHEQUE && c.status === CollectionStatus.PENDING);

    pendingCheques.forEach(collection => {
      // Match by Cheque Number AND Amount
      const match = statementData.find(entry => 
        entry.cheque_number === collection.cheque_number && 
        entry.amount === collection.amount
      );

      if (match) {
        matches.push({ collection, entry: match });
      } else {
        unmatched.push(collection);
      }
    });

    setMatchedItems(matches);
    setUnmatchedCollections(unmatched);
    setActiveStep(2);
  };

  const confirmReconciliation = () => {
    const clearedIds = matchedItems.filter(m => m.entry.status === 'CLEARED').map(m => m.collection.collection_id);
    const returnedIds = matchedItems.filter(m => m.entry.status === 'RETURNED').map(m => m.collection.collection_id);
    
    if (clearedIds.length > 0) onReconcile(clearedIds, CollectionStatus.REALIZED);
    if (returnedIds.length > 0) onReconcile(returnedIds, CollectionStatus.RETURNED);
    
    // Reset
    setActiveStep(1);
    setStatementData([]);
    setMatchedItems([]);
    alert(`Successfully reconciled ${matchedItems.length} cheques.`);
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bank Reconciliation</h1>

      {activeStep === 1 && (
        <div className="bg-white p-8 rounded-lg shadow border border-dashed border-gray-300 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Upload Bank Statement</h2>
          <p className="text-sm text-gray-500 mb-6">Supported formats: CSV, Excel (Mocked for this demo)</p>
          
          <input 
            type="file" 
            id="statement-upload" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          {!statementData.length ? (
            <label 
              htmlFor="statement-upload"
              className="px-6 py-2 bg-brand-600 text-white rounded-md cursor-pointer hover:bg-brand-700 transition"
            >
              Select File
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-600 font-medium">
                <FileText className="mr-2" /> Statement Loaded ({statementData.length} entries)
              </div>
              <button 
                onClick={runAutoReconciliation}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center mx-auto"
              >
                <RefreshCw className="mr-2" size={18} />
                Auto Reconcile
              </button>
            </div>
          )}
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="text-green-500 mr-2" /> 
              Matched Transactions ({matchedItems.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cheque No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statement Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {matchedItems.map((match, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{match.collection.cheque_number}</td>
                      <td className="px-4 py-2 text-sm">${match.collection.amount}</td>
                      <td className="px-4 py-2 text-sm">{match.entry.date}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${match.entry.status === 'CLEARED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {match.entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Will mark as {match.entry.status === 'CLEARED' ? 'Realized' : 'Returned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
             <button 
               onClick={() => { setActiveStep(1); setStatementData([]); }}
               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
             >
               Cancel
             </button>
             <button 
               onClick={confirmReconciliation}
               className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium"
             >
               Confirm Updates
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;
