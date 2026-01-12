import React, { useState } from 'react';
import { Collection, Customer, Route, PaymentType, CollectionStatus } from '../types';
import { FileText, Download } from 'lucide-react';

interface ReportsProps {
  collections: Collection[];
  customers: Customer[];
  routes: Route[];
}

type ReportType = 'DAILY_COLLECTION' | 'PENDING_CHEQUES' | 'RETURNED_CHEQUES' | 'OUTSTANDING' | 'ROUTE_SUMMARY';

const Reports: React.FC<ReportsProps> = ({ collections, customers, routes }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('DAILY_COLLECTION');

  const renderContent = () => {
    switch(activeReport) {
      case 'DAILY_COLLECTION': {
        const sorted = [...collections].sort((a,b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime());
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map(c => (
                <tr key={c.collection_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.collection_date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{customers.find(cust => cust.customer_id === c.customer_id)?.business_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.payment_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">${c.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      case 'PENDING_CHEQUES': {
        const pending = collections.filter(c => c.payment_type === PaymentType.CHEQUE && c.status === CollectionStatus.PENDING);
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheque No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Realize Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pending.map(c => (
                <tr key={c.collection_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.cheque_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.bank}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.realize_date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">${c.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      case 'ROUTE_SUMMARY': {
        const summary = routes.map(r => {
            const routeCustomers = customers.filter(c => c.route_id === r.route_id).map(c => c.customer_id);
            const routeCollections = collections.filter(c => routeCustomers.includes(c.customer_id));
            const total = routeCollections.reduce((sum, c) => sum + c.amount, 0);
            return { ...r, total };
        });
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map(r => (
                <tr key={r.route_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.route_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{customers.filter(c => c.route_id === r.route_id).length}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">${r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      // Simple placeholders for others
      default: return <div className="p-6 text-center text-gray-500">Report details available in exported version.</div>;
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50">
          <Download size={16} className="mr-2" /> Export PDF
        </button>
      </div>

      <div className="mb-6 flex overflow-x-auto space-x-2 pb-2">
        {[
          { id: 'DAILY_COLLECTION', label: 'Daily Collection' },
          { id: 'PENDING_CHEQUES', label: 'Pending Cheques' },
          { id: 'RETURNED_CHEQUES', label: 'Returned Cheques' },
          { id: 'ROUTE_SUMMARY', label: 'Route Summary' },
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setActiveReport(rep.id as ReportType)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
              activeReport === rep.id ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
