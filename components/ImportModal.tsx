import React, { useState } from 'react';
import { Customer, CustomerStatus } from '../types';
import { X, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  onImport: (customers: Customer[]) => void;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleProcessImport = () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        
        if (rows.length < 2) throw new Error("File seems empty or invalid format.");

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const customers: Customer[] = [];

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',').map(c => c.trim());
          const bizName = cols[headers.indexOf('business_name')] || cols[headers.indexOf('shop/business name')] || cols[0];
          const custName = cols[headers.indexOf('customer_name')] || cols[headers.indexOf('customer name')] || cols[1];
          const phone = cols[headers.indexOf('phone_number')] || cols[headers.indexOf('phone number')] || cols[3];
          
          if (!bizName || !phone) continue;

          customers.push({
            customer_id: `C-IMP-${Date.now()}-${i}`,
            customer_name: custName || bizName,
            business_name: bizName,
            address: cols[headers.indexOf('residential address')] || cols[7] || '',
            whatsapp_number: cols[headers.indexOf('whatsapp number')] || cols[6] || '',
            phone_number: phone,
            location: '',
            credit_limit: parseFloat(cols[headers.indexOf('credit limit ($)')]) || 50000,
            credit_period_days: parseInt(cols[headers.indexOf('credit period (days)')]) || 30,
            route_id: cols[headers.indexOf('assigned route')] || 'R01',
            status: CustomerStatus.ACTIVE
          });
        }

        if (customers.length === 0) throw new Error("No valid customer data found in file.");
        
        onImport(customers);
        setIsUploading(false);
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV file.");
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-900/40 dark:bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-brand-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-brand-50 dark:border-slate-800">
          <h3 className="text-xl font-bold text-brand-800 dark:text-slate-100">Bulk Import Customers</h3>
          <button onClick={onClose} className="text-brand-400 p-2 hover:bg-brand-50 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-brand-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-brand-50/30 dark:bg-slate-800/30">
            <Upload size={40} className="mx-auto text-brand-300 mb-4" />
            <p className="text-sm font-bold text-brand-700 dark:text-slate-300">Drag and drop your CSV file here</p>
            <p className="text-[10px] text-brand-400 mt-1 mb-4 italic">Format: Shop Name, Customer Name, Route, Phone...</p>
            <input type="file" id="bulk-import" className="hidden" accept=".csv" onChange={handleFileChange} />
            <label htmlFor="bulk-import" className="px-6 py-2 bg-white dark:bg-slate-800 border border-brand-200 dark:border-slate-700 rounded-xl text-xs font-bold text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors">
              {file ? file.name : 'Choose CSV File'}
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center text-xs border border-red-100">
              <AlertCircle size={14} className="mr-2 shrink-0" /> {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button 
              disabled={!file || isUploading}
              onClick={handleProcessImport}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${!file || isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-lg hover:bg-brand-700 active:scale-95'}`}
            >
              {isUploading ? <><Loader2 className="animate-spin mr-2" /> Processing...</> : 'Process Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;