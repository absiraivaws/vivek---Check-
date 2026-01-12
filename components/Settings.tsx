import React, { useState } from 'react';
import { GlobalSettings } from '../types';
import { Save } from 'lucide-react';

interface SettingsProps {
  settings: GlobalSettings;
  onSave: (s: GlobalSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<GlobalSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Settings Saved Successfully');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Configuration</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Credit Limit ($)</label>
                <input
                  type="number"
                  value={formData.default_credit_limit}
                  onChange={(e) => setFormData({...formData, default_credit_limit: Number(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
                <p className="mt-1 text-xs text-gray-500">Applied when creating new customers.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Credit Period (Days)</label>
                <input
                  type="number"
                  value={formData.default_credit_period}
                  onChange={(e) => setFormData({...formData, default_credit_period: Number(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Features</h3>
            <div className="flex items-center justify-between">
              <span className="flex-grow flex flex-col">
                <span className="text-sm font-medium text-gray-900">Enable Cheque Capture</span>
                <span className="text-sm text-gray-500">Allow using camera to scan cheques via Gemini AI</span>
              </span>
              <button
                type="button"
                onClick={() => setFormData({...formData, enable_cheque_camera: !formData.enable_cheque_camera})}
                className={`${formData.enable_cheque_camera ? 'bg-brand-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span
                  aria-hidden="true"
                  className={`${formData.enable_cheque_camera ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-brand-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <Save size={18} className="mr-2" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
