import React, { useState, useMemo } from 'react';
import { Collection, CollectionStatus, PaymentType, BankStatementEntry } from '../types';
import { Upload, CheckCircle, RefreshCw, FileText, Landmark, Search, AlertCircle, ArrowRight, FileType, CheckCircle2, PlusCircle } from 'lucide-react';
import { formatAmount } from '../App';

interface ReconciliationProps {
  collections: Collection[];
  onReconcile: (collectionIds: string[], status: CollectionStatus) => void;
}

interface StatementItem {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  extractedCheque?: string;
  extractedBank?: string;
  extractedBranch?: string;
}

const Reconciliation: React.FC<ReconciliationProps> = ({ collections, onReconcile }) => {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statementItems, setStatementItems] = useState<StatementItem[]>([]);
  
  // Results State
  const [systemMatches, setSystemMatches] = useState<{collection: Collection, statement: StatementItem}[]>([]);
  const [newBankDeposits, setNewBankDeposits] = useState<StatementItem[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Simulate reading the provided PDF Statement OCR
    setTimeout(() => {
      const mockParsedData: StatementItem[] = [
        { date: '09-Jan-2026', description: 'CASH DEPOSIT', reference: '1046300010092', debit: 0, credit: 114650.00 },
        { date: '08-Jan-2026', description: 'CHQ DEPOSIT 035346/7135/166', reference: '35300010011', debit: 0, credit: 21390.00, extractedCheque: '035346', extractedBank: '7135', extractedBranch: '166' },
        { date: '02-Jan-2026', description: 'CHQ DEPOSIT 324673/7287/094', reference: '35300010011', debit: 0, credit: 7610.00, extractedCheque: '324673', extractedBank: '7287', extractedBranch: '094' },
        { date: '01-Jan-2026', description: 'CHQ DEPOSIT 106240/7056/154', reference: '35300010001', debit: 0, credit: 53800.00, extractedCheque: '106240', extractedBank: '7056', extractedBranch: '154' },
      ];
      
      setStatementItems(mockParsedData);
      setIsProcessing(false);
    }, 1500);
  };

  const startMatching = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const matches: {collection: Collection, statement: StatementItem}[] = [];
      const newDeposits: StatementItem[] = [];

      const pendingCheques = collections.filter(c => 
        c.payment_type === PaymentType.CHEQUE && 
        c.status === CollectionStatus.PENDING
      );

      statementItems.forEach(item => {
        if (item.credit > 0) {
          // Look for match in system using cheque number or amount
          const match = pendingCheques.find(c => 
            (c.cheque_number === item.extractedCheque && c.amount === item.credit) ||
            (item.description.includes(c.cheque_number || 'NON_EXISTENT') && c.amount === item.credit)
          );

          if (match) {
            matches.push({ collection: match, statement: item });
          } else if (item.extractedCheque) {
            newDeposits.push(item);
          }
        }
      });

      setSystemMatches(matches);
      setNewBankDeposits(newDeposits);
      setIsProcessing(false);
      setActiveStep(2);
    }, 1000);
  };

  const handleConfirm = () => {
    const idsToRealize = systemMatches.map(m => m.collection.collection_id);
    if (idsToRealize.length > 0) {
      onReconcile(idsToRealize, CollectionStatus.REALIZED);
    }
    alert(`${idsToRealize.length} cheques marked as Realized (Collected). ${newBankDeposits.length} new bank deposits identified.`);
    setActiveStep(1);
    setStatementItems([]);
  };

  return (
    <div className="p-6 h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-slate-100 flex items-center gap-2">
            <Landmark className="text-brand-600" /> Bank Reconciliation
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {activeStep === 1 ? 'Import PDF/CSV Bank Statement' : 'Verify system matches vs bank direct entries'}
          </p>
        </div>
        {activeStep === 2 && (
          <div className="flex gap-4">
            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-brand-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase">System Matches</p>
              <p className="text-lg font-bold text-green-600">{systemMatches.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-brand-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Bank Direct</p>
              <p className="text-lg font-bold text-brand-600">{newBankDeposits.length}</p>
            </div>
          </div>
        )}
      </div>

      {activeStep === 1 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border-2 border-dashed border-brand-200 dark:border-slate-800 text-center">
            {isProcessing ? (
              <div className="py-10">
                <RefreshCw className="animate-spin mx-auto text-brand-600 mb-4" size={48} />
                <p className="font-bold text-brand-800 dark:text-slate-200">Reading Statement Data...</p>
                <p className="text-xs text-gray-500 mt-2">Extracting CHQ DEPOSIT references and amounts</p>
              </div>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <FileType size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2">Upload Bank Statement</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                  Accepts PDF, CSV, or Text formats. We automatically extract cheque numbers and branch codes.
                </p>
                
                <input type="file" id="stmt-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.csv,.txt" />
                
                {!statementItems.length ? (
                  <label htmlFor="stmt-upload" className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold cursor-pointer hover:bg-brand-700 transition shadow-xl inline-flex items-center gap-2">
                    <Upload size={20} /> Select Statement File
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-brand-50 dark:bg-brand-900/10 p-4 rounded-2xl border border-brand-100 inline-block text-left">
                      <p className="text-brand-800 dark:text-brand-400 font-bold flex items-center gap-2">
                        <CheckCircle size={18} /> {statementItems.length} Entries Identified
                      </p>
                      <ul className="text-[10px] text-brand-600 mt-2 space-y-1">
                        <li>• Detected 'CHQ DEPOSIT' patterns</li>
                        <li>• Extracted 6-digit cheque references</li>
                      </ul>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => setStatementItems([])} className="px-6 py-3 text-sm font-bold text-gray-500">Reset</button>
                      <button onClick={startMatching} className="px-10 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
                        Start Reconciliation <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Path 1: Matches */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-green-500" size={20} />
              <h3 className="font-bold text-gray-800 dark:text-slate-100">System Matches (Pending → Realized)</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Cheque No</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Bank/Branch Code</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {systemMatches.map((m, i) => (
                    <tr key={i} className="hover:bg-green-50/30 dark:hover:bg-green-900/10">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-slate-200">{m.statement.extractedCheque}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400">
                        {m.statement.extractedBank || 'N/A'} / {m.statement.extractedBranch || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-brand-700 dark:text-brand-400">
                        ${formatAmount(m.statement.credit)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase">Verified Match</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Path 2: Bank Directs */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="text-brand-500" size={20} />
              <h3 className="font-bold text-gray-800 dark:text-slate-100">Bank Direct Deposits (Not in System)</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Bank/Branch Code</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {newBankDeposits.map((item, i) => (
                    <tr key={i} className="hover:bg-brand-50/30 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-slate-200">{item.extractedCheque || item.reference}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400">
                        {item.extractedBank || 'N/A'} / {item.extractedBranch || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-brand-700 dark:text-brand-400">
                        ${formatAmount(item.credit)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-[10px] font-bold text-brand-600 hover:underline uppercase">Quick Add to Ledger</button>
                      </td>
                    </tr>
                  ))}
                  {newBankDeposits.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 text-xs italic">No additional bank deposits found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex justify-end gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
            <button onClick={() => setActiveStep(1)} className="px-8 py-3 text-gray-500 font-bold">Cancel</button>
            <button 
              onClick={handleConfirm}
              className="px-12 py-4 bg-brand-600 text-white rounded-2xl font-extrabold shadow-2xl hover:bg-brand-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle size={20} /> Confirm Reconciliation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;