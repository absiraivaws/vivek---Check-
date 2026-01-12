import React, { useState } from 'react';
import { Customer, Route, CustomerStatus } from '../types';
import { MapPin, Edit, Plus, Save, X, Phone, User } from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  routes: Route[];
  onAddCustomer: (c: Customer) => void;
  onEditCustomer: (c: Customer) => void;
  onAddRoute: (r: Route) => void;
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, routes, onAddCustomer, onEditCustomer, onAddRoute }) => {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'ROUTES'>('CUSTOMERS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    status: CustomerStatus.ACTIVE,
    location: '',
  });

  // Route Form State
  const [newRouteName, setNewRouteName] = useState('');

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

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        }));
      }, (err) => {
        alert("Error capturing location: " + err.message);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData = {
      ...formData,
      customer_id: editingCustomer ? editingCustomer.customer_id : `C${Date.now()}`,
    } as Customer;

    if (editingCustomer) {
      onEditCustomer(customerData);
    } else {
      onAddCustomer(customerData);
    }
    setIsModalOpen(false);
  };

  const handleSaveRoute = () => {
    if (!newRouteName) return;
    onAddRoute({
      route_id: `R${Date.now()}`,
      route_name: newRouteName,
      status: 'Active'
    });
    setNewRouteName('');
  };

  return (
    <div className="p-4 h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('CUSTOMERS')} 
            className={`px-4 py-2 rounded-md ${activeTab === 'CUSTOMERS' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Customers
          </button>
          <button 
            onClick={() => setActiveTab('ROUTES')} 
            className={`px-4 py-2 rounded-md ${activeTab === 'ROUTES' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Routes
          </button>
        </div>
      </div>

      {activeTab === 'CUSTOMERS' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Plus size={18} className="mr-2" /> Add Customer
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(c => (
              <div key={c.customer_id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                <button onClick={() => openModal(c)} className="absolute top-4 right-4 text-gray-400 hover:text-brand-600">
                  <Edit size={16} />
                </button>
                <div className="flex items-center mb-2">
                  <div className="bg-brand-100 p-2 rounded-full mr-3">
                    <User size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{c.business_name}</h3>
                    <p className="text-xs text-gray-500">{c.customer_name}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mt-3">
                  <p className="flex items-center"><Phone size={14} className="mr-2"/> {c.phone_number}</p>
                  <p className="flex items-center"><MapPin size={14} className="mr-2"/> {c.location || 'No GPS'}</p>
                  <div className="flex justify-between mt-2 pt-2 border-t">
                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">Route: {routes.find(r => r.route_id === c.route_id)?.route_name || c.route_id}</span>
                    <span className="text-xs font-medium text-green-600">Limit: ${c.credit_limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'ROUTES' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">New Route Name</label>
              <input 
                type="text" 
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                placeholder="e.g. Negombo Road"
              />
            </div>
            <button onClick={handleSaveRoute} className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">
              Create Route
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {routes.map(route => {
                const customerCount = customers.filter(c => c.route_id === route.route_id).length;
                return (
                  <li key={route.route_id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-brand-600 truncate">{route.route_name}</p>
                      <p className="text-xs text-gray-500">ID: {route.route_id}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {customerCount} Customers
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input required type="text" value={formData.business_name || ''} onChange={e => setFormData({...formData, business_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input required type="text" value={formData.customer_name || ''} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input required type="text" value={formData.phone_number || ''} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                  <input type="text" value={formData.whatsapp_number || ''} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIC</label>
                  <input type="text" value={formData.nic || ''} onChange={e => setFormData({...formData, nic: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <select required value={formData.route_id || ''} onChange={e => setFormData({...formData, route_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm">
                    <option value="">Select Route</option>
                    {routes.map(r => <option key={r.route_id} value={r.route_id}>{r.route_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                  <input type="number" value={formData.credit_limit || ''} onChange={e => setFormData({...formData, credit_limit: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Period (Days)</label>
                  <input type="number" value={formData.credit_period_days || ''} onChange={e => setFormData({...formData, credit_period_days: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GPS Location</label>
                <div className="flex gap-2">
                  <input readOnly type="text" value={formData.location || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm bg-gray-50" />
                  <button type="button" onClick={handleCaptureGPS} className="mt-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 flex items-center">
                    <MapPin size={16} className="mr-1"/> Capture
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 shadow-sm">
                  <Save size={18} className="inline mr-2" /> Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
