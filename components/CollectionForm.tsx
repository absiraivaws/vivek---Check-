import React, { useState, useRef, useEffect } from 'react';
import { Customer, PaymentType, Collection, CollectionStatus, GlobalSettings } from '../types';
import { Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { analyzeChequeImage } from '../services/geminiService';

interface CollectionFormProps {
  customers: Customer[];
  settings?: GlobalSettings;
  onSave: (collection: Omit<Collection, 'collection_id'>) => void;
  onCancel: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ customers, settings, onSave, onCancel }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [amount, setAmount] = useState('');
  
  // Cheque specific state
  const [chequeNumber, setChequeNumber] = useState('');
  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [realizeDate, setRealizeDate] = useState('');
  const [chequeImage, setChequeImage] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCustomer = customers.find(c => c.customer_id === selectedCustomerId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setChequeImage(base64);
      
      // Auto-analyze with Gemini
      setIsAnalyzing(true);
      setError(null);
      const data = await analyzeChequeImage(base64);
      setIsAnalyzing(false);

      if (data) {
        if (data.cheque_number) setChequeNumber(data.cheque_number);
        if (data.bank) setBank(data.bank);
        if (data.branch) setBranch(data.branch);
        if (data.amount) setAmount(data.amount.toString());
        if (data.date) setRealizeDate(data.date);
      } else {
        setError("Could not auto-extract details. Please enter manually.");
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    if (!selectedCustomerId || !amount) {
      setError("Customer and Amount are required.");
      return false;
    }
    
    if (paymentType === PaymentType.CHEQUE) {
      if (!chequeNumber || !bank || !realizeDate) {
        setError("Cheque details incomplete.");
        return false;
      }
      
      if (selectedCustomer) {
         // Credit Period Validation
         const today = new Date();
         const rDate = new Date(realizeDate);
         const diffTime = Math.abs(rDate.getTime() - today.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         
         if (rDate > today && diffDays > selectedCustomer.credit_period_days) {
            setError(`Cheque date exceeds allowed credit period of ${selectedCustomer.credit_period_days} days.`);
            return false;
         }
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    const isPending = paymentType === PaymentType.CARD || paymentType === PaymentType.CHEQUE;

    onSave({
      customer_id: selectedCustomerId,
      payment_type: paymentType,
      amount: parseFloat(amount),
      status: isPending ? CollectionStatus.PENDING : CollectionStatus.RECEIVED,
      collection_date: new Date().toISOString().split('T')[0],
      cheque_number: paymentType === PaymentType.CHEQUE ? chequeNumber : undefined,
      bank: paymentType === PaymentType.CHEQUE ? bank : undefined,
      branch: paymentType === PaymentType.CHEQUE ? branch : undefined,
      realize_date: paymentType === PaymentType.CHEQUE ? realizeDate : undefined,
      cheque_image_base64: chequeImage || undefined
    });
  };

  // Check if camera is enabled in settings (default true if settings not provided)
  const cameraEnabled = settings ? settings.enable_cheque_camera : true;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto my-4">
      <h2 className="text-xl font-bold mb-6 text-gray-800">New Collection</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <select 
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.business_name} ({c.customer_name})
              </option>
            ))}
          </select>
          {selectedCustomer && (
             <p className="text-xs text-gray-500 mt-1">
               Credit Limit: ${selectedCustomer.credit_limit} | Period: {selectedCustomer.credit_period_days} days
             </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Type</label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {Object.values(PaymentType).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setPaymentType(type)}
                className={`p-2 text-sm rounded-md border ${paymentType === type ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            placeholder="0.00"
          />
        </div>

        {paymentType === PaymentType.CHEQUE && (
          <div className="border-t pt-4 mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Cheque Details</h3>
              {cameraEnabled && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center text-sm text-brand-600 hover:text-brand-700"
                  >
                    <Camera size={16} className="mr-1" />
                    Scan Cheque
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>

            {chequeImage && (
              <div className="relative h-40 w-full bg-gray-100 rounded-md overflow-hidden">
                <img src={chequeImage} alt="Cheque" className="h-full w-full object-contain" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    <Loader2 className="animate-spin mr-2" /> Analyzing...
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Cheque Number</label>
                <input
                  type="text"
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Realize Date</label>
                <input
                  type="date"
                  value={realizeDate}
                  onChange={(e) => setRealizeDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Bank</label>
                <input
                  type="text"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
          >
            Save Collection
          </button>
        </div>
      </form>
    </div>
  );
};

export default CollectionForm;
