import React, { useState, useMemo } from 'react';
import { Customer, Route, CustomerStatus } from '../types';
import { MapPin, Edit, Plus, Save, X, Phone, User, Upload, Briefcase, Search, Filter, Info, Trash2 } from 'lucide-react';
import ImportModal from './ImportModal';

interface CustomerManagerProps {
  customers: Customer[];
  routes: Route[];
  onAddCustomer: (c: Customer) => void;
  onEditCustomer: (c: Customer) => void;
  onAddRoute: (r: Route) => void;
  onImport: (c: Customer[]) => void;
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, routes, onAddCustomer, onEditCustomer, onAddRoute, onImport }) => {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'ROUTES'>('CUSTOMERS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('ALL');

  const [formData, setFormData] = useState<Partial<Customer>>({
    status: CustomerStatus.ACTIVE,
    location: '',
  });

  const [routeFormData, setRouteFormData] = useState<Partial<Route>>({
    route_name: '',
    status: 'Active'
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({ 
        status: CustomerStatus.ACTIVE, 
        credit_limit: 50000, 
        credit_period_days: 30,
        location: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData = {
      ...formData,
      customer_id: editingCustomer ? editingCustomer.customer_id : `C${Date.now()}`,
    } as Customer;

    if (editingCustomer) onEditCustomer(customerData);
    else onAddCustomer(customerData);
    setIsModalOpen(false);
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

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        const matchesSearch = 
          c.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone_number.includes(searchQuery);
        const matchesRoute = selectedRouteFilter === 'ALL' || c.route_id === selectedRouteFilter;
        return matchesSearch && matchesRoute;
      })
      .sort((a, b) => a.business_name.localeCompare(b.business_name));
  }, [customers, searchQuery, selectedRouteFilter]);

  const inputClass = "mt-1 block w-full rounded-lg border-2 border-brand-100 dark:border-slate-700 p-2 shadow-sm focus:border-brand-500 bg-brand-50 dark:bg-slate-800 transition-colors outline-none dark:text-slate-100";
  const labelClass = "block text-xs font-bold text-brand-700 dark:text-slate-400 uppercase tracking-wider mb-1";

  return (
    <div className="p-4 h-full overflow-y-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-slate-100">Master Data</h1>
          <p className="text-sm text-brand-500 dark:text-slate-400">Manage customers and delivery routes</p>
        </div>
        <div className="flex bg-brand-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setActiveTab('CUSTOMERS')} className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'CUSTOMERS' ? 'bg-brand-600 text-white shadow-md' : 'text-brand-700 dark:text-slate-400 hover:bg-brand-200 dark:hover:bg-slate-700'}`}>Customers</button>
          <button onClick={() => setActiveTab('ROUTES')} className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'ROUTES' ? 'bg-brand-600 text-white shadow-md' : 'text-brand-700 dark:text-slate-400 hover:bg-brand-200 dark:hover:bg-slate-700'}`}>Routes</button>
        </div>
      </div>

      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                <input 
                  type="text" 
                  placeholder="Search business, name or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-xl border-2 border-brand-50 dark:border-slate-800 bg-brand-50/50 dark:bg-slate-800 outline-none focus:border-brand-300 transition-all text-sm dark:text-slate-100"
                />
              </div>
              <div className="relative min-w-[180px]">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                <select 
                  value={selectedRouteFilter}
                  onChange={(e) => setSelectedRouteFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full rounded-xl border-2 border-brand-50 dark:border-slate-800 bg-brand-50/50 dark:bg-slate-800 outline-none focus:border-brand-300 transition-all text-sm appearance-none dark:text-slate-100"
                >
                  <option value="ALL">All Routes</option>
                  {routes.map(r => <option key={r.route_id} value={r.route_id}>{r.route_name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <button onClick={() => setIsImportOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border-2 border-brand-200 dark:border-slate-700 text-brand-600 dark:text-slate-200 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-700 font-bold transition-all text-sm">
                <Upload size={16} className="mr-2" /> Import
              </button>
              <button onClick={() => openModal()} className="flex-1 lg:flex-none flex items-center justify-center px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold shadow-lg transition-all text-sm">
                <Plus size={16} className="mr-2" /> Add Customer
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-50 dark:divide-slate-800">
                <thead className="bg-brand-50/50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase tracking-wider">Business / Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-brand-700 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-brand-50 dark:divide-slate-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-brand-400 italic">No customers found.</td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => (
                      <tr key={c.customer_id} className="hover:bg-brand-50/30 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-brand-100 dark:bg-slate-800 p-2 rounded-lg mr-3">
                              <Briefcase size={16} className="text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{c.business_name}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">{c.customer_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-slate-300 text-xs font-bold rounded-full border border-brand-100 dark:border-slate-700">
                            {routes.find(r => r.route_id === c.route_id)?.route_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                            <Phone size={14} className="mr-1.5 text-brand-400" />
                            {c.phone_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => openModal(c)} className="text-brand-500 hover:text-brand-700 p-2 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ROUTES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-brand-800 dark:text-slate-100 mb-4">{editingRoute ? 'Edit Route' : 'Add New Route'}</h3>
            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className={labelClass}>Route Name (e.g. Route 01)</label>
                <input 
                  required 
                  type="text" 
                  value={routeFormData.route_name} 
                  onChange={e => setRouteFormData({...routeFormData, route_name: e.target.value})} 
                  className={inputClass} 
                  placeholder="Route 01"
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
                <Save size={18} /> {editingRoute ? 'Update Route' : 'Save Route'}
              </button>
              {editingRoute && (
                <button type="button" onClick={() => {setEditingRoute(null); setRouteFormData({route_name: '', status: 'Active'})}} className="w-full py-2 text-gray-500 font-medium">Cancel</button>
              )}
            </form>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-brand-100 dark:border-slate-800 overflow-hidden">
            <table className="min-w-full divide-y divide-brand-50 dark:divide-slate-800">
              <thead className="bg-brand-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Route Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-brand-700 dark:text-slate-400 uppercase">Actions</th>
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-900/40 dark:bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-brand-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-brand-50 dark:border-slate-800">
              <h3 className="text-xl font-bold text-brand-800 dark:text-slate-100">{editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-400 p-2 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2"><User size={16}/> Personal Information</h4>
                  <div><label className={labelClass}>Customer Name</label><input required type="text" value={formData.customer_name || ''} onChange={e => setFormData({...formData, customer_name: e.target.value})} className={inputClass} /></div>
                  <div><label className={labelClass}>Phone Number</label><input required type="text" value={formData.phone_number || ''} onChange={e => setFormData({...formData, phone_number: e.target.value})} className={inputClass} /></div>
                  <div><label className={labelClass}>WhatsApp Number</label><input type="text" value={formData.whatsapp_number || ''} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className={inputClass} /></div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2"><Briefcase size={16}/> Business Details</h4>
                  <div><label className={labelClass}>Shop/Business Name</label><input required type="text" value={formData.business_name || ''} onChange={e => setFormData({...formData, business_name: e.target.value})} className={inputClass} /></div>
                  <div><label className={labelClass}>BR Number</label><input type="text" value={formData.br_number || ''} onChange={e => setFormData({...formData, br_number: e.target.value})} className={inputClass} placeholder="Reg Number" /></div>
                  <div><label className={labelClass}>Residential Address</label><textarea value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass + " h-24"} /></div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2"><MapPin size={16}/> Route & Credit</h4>
                  <div><label className={labelClass}>Assigned Route</label>
                    <select required value={formData.route_id || ''} onChange={e => setFormData({...formData, route_id: e.target.value})} className={inputClass}>
                      <option value="">Select Route</option>
                      {routes.map(r => <option key={r.route_id} value={r.route_id}>{r.route_name}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Credit Limit ($)</label><input type="number" value={formData.credit_limit || ''} onChange={e => setFormData({...formData, credit_limit: Number(e.target.value)})} className={inputClass} /></div>
                  <div><label className={labelClass}>Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as CustomerStatus})} className={inputClass}>
                      <option value={CustomerStatus.ACTIVE}>Active</option>
                      <option value={CustomerStatus.INACTIVE}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8 mt-4 border-t border-brand-50 dark:border-slate-800 gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center gap-2"><Save size={18}/> {editingCustomer ? 'Update Profile' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportOpen && <ImportModal onImport={(c) => { onImport(c); setIsImportOpen(false); }} onClose={() => setIsImportOpen(false)} />}
    </div>
  );
};

export default CustomerManager;