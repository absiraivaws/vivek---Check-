import React, { useState } from 'react';
import { GlobalSettings, Route } from '../types';
import { Save, Globe, Edit, MapPin } from 'lucide-react';

interface SettingsProps {
  settings: GlobalSettings;
  routes: Route[];
  onSave: (s: GlobalSettings) => void;
  onAddRoute: (r: Route) => void;
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

const Settings: React.FC<SettingsProps> = ({ settings, routes, onSave, onAddRoute }) => {
  const [formData, setFormData] = useState<GlobalSettings>(settings);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [routeFormData, setRouteFormData] = useState<Partial<Route>>({
    route_name: '',
    status: 'Active'
  });

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

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const routeData = {
      ...routeFormData,
      route_id: editingRoute ? editingRoute.route_id : `R${Date.now()}`,
    } as Route;
    onAddRoute(routeData);
    setRouteFormData({ route_name: '', status: 'Active' });
    setEditingRoute(null);
  };

  const inputClass = "mt-1 block w-full rounded-xl border-2 border-brand-100 dark:border-slate-700 p-3 shadow-sm focus:border-brand-500 bg-brand-50 dark:bg-slate-800 transition-all outline-none font-medium text-brand-900 dark:text-slate-100";
  const labelClass = "block text-xs font-bold text-brand-700 dark:text-slate-400 uppercase tracking-wider mb-1";

  return (
    <div className="p-4 max-w-4xl mx-auto mt-8 pb-20 space-y-12">
      <h1 className="text-2xl font-bold text-brand-800 dark:text-slate-100">System Configuration</h1>
      
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Save size={18} className="mr-2" /> Save Global Settings
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-brand-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-brand-700 dark:text-brand-400 mb-6 border-b border-brand-50 dark:border-slate-800 pb-2">Route Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h4 className="font-bold text-gray-700 dark:text-slate-200 mb-4">{editingRoute ? 'Edit Route' : 'Add New Route'}</h4>
            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className={labelClass}>Route Name</label>
                <input 
                  required 
                  type="text" 
                  value={routeFormData.route_name} 
                  onChange={e => setRouteFormData({...routeFormData, route_name: e.target.value})} 
                  className={inputClass} 
                  placeholder="e.g. Western Route"
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select 
                  value={routeFormData.status} 
                  onChange={e => setRouteFormData({...routeFormData, status: e.target.value as any})} 
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all">
                <Save size={18} /> {editingRoute ? 'Update' : 'Save'}
              </button>
              {editingRoute && (
                <button type="button" onClick={() => {setEditingRoute(null); setRouteFormData({route_name: '', status: 'Active'})}} className="w-full py-2 text-gray-500 text-sm font-medium">Cancel</button>
              )}
            </form>
          </div>
          <div className="md:col-span-2 overflow-hidden border border-brand-50 dark:border-slate-800 rounded-xl">
            <table className="min-w-full divide-y divide-brand-50 dark:divide-slate-800">
              <thead className="bg-brand-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Route Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50 dark:divide-slate-800">
                {routes.map(r => (
                  <tr key={r.route_id} className="hover:bg-brand-50/30 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-slate-200">{r.route_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {setEditingRoute(r); setRouteFormData(r)}} className="text-brand-500 p-2 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg"><Edit size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;