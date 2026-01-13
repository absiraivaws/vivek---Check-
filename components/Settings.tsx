import React, { useState } from 'react';
import { GlobalSettings } from '../types';
import { Save, Globe } from 'lucide-react';

interface SettingsProps {
  settings: GlobalSettings;
  onSave: (s: GlobalSettings) => void;
}

const COUNTRIES = [
  { name: 'Australia', currency: 'A$' },
  { name: 'Canada', currency: 'C$' },
  { name: 'India', currency: '₹' },
  { name: 'New Zealand', currency: 'NZ$' },
  { name: 'Singapore', currency: 'S$' },
  { name: 'Sri Lanka', currency: 'Rs.' },
  { name: 'United Kingdom', currency: '£' },
  { name: 'United States', currency: '$' }
].sort((a, b) => a.name.localeCompare(b.name));

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<GlobalSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Settings Saved Successfully');
  };

  const handleCountryChange = (countryName: string) => {
    const selected = COUNTRIES.find(c => c.name === countryName);
    if (selected) {
      setFormData({
        ...formData,
        country: selected.name,
        currency_code: selected.currency
      });
    }
  };

  const inputClass = "mt-1 block w-full rounded-xl border-2 border-brand-100 dark:border-slate-700 p-3 shadow-sm focus:border-brand-500 bg-brand-50 dark:bg-slate-800 transition-all outline-none font-medium text-brand-900 dark:text-slate-100";

  return (
    <div className="p-4 max-w-2xl mx-auto mt-8 pb-20">
      <h1 className="text-2xl font-bold text-brand-800 dark:text-slate-100 mb-6">System Settings</h1>
      
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-brand-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div>
            <h3 className="text-lg font-bold text-brand-700 dark:text-brand-400 mb-4 border-b border-brand-50 dark:border-slate-800 pb-2">Localization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <Globe size={14} /> System Country
                </label>
                <select 
                  value={formData.country} 
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className={inputClass}
                >
                  {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-400 mb-1">Currency Preview</label>
                <div className="p-3 bg-brand-100 dark:bg-slate-800 rounded-xl font-bold text-brand-700 dark:text-brand-400 text-center text-lg">
                  {formData.currency_code}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-brand-700 dark:text-brand-400 mb-4 border-b border-brand-50 dark:border-slate-800 pb-2">Credit Configuration</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-400 mb-1">Default Credit Limit ({formData.currency_code})</label>
                <input
                  type="number"
                  value={formData.default_credit_limit}
                  onChange={(e) => setFormData({...formData, default_credit_limit: Number(e.target.value)})}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-400 mb-1">Default Credit Period (Days)</label>
                <input
                  type="number"
                  value={formData.default_credit_period}
                  onChange={(e) => setFormData({...formData, default_credit_period: Number(e.target.value)})}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center rounded-xl border border-transparent bg-brand-600 py-3 px-8 text-sm font-extrabold text-white shadow-xl hover:bg-brand-700 focus:outline-none transition-all active:scale-95"
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