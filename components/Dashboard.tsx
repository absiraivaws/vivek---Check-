import React, { useMemo } from 'react';
import { Collection, CollectionStatus, PaymentType, GlobalSettings } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, CreditCard, AlertTriangle, Activity } from 'lucide-react';
import { formatAmount } from '../App';

interface DashboardProps {
  collections: Collection[];
  settings: GlobalSettings;
}

const COLORS = ['#0ea5e9', '#00C49F', '#FFBB28', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ collections, settings }) => {
  
  const stats = useMemo(() => {
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
    const pendingCheques = collections.filter(c => c.payment_type === PaymentType.CHEQUE && c.status === CollectionStatus.PENDING);
    const pendingAmount = pendingCheques.reduce((sum, c) => sum + c.amount, 0);
    const returnedCheques = collections.filter(c => c.status === CollectionStatus.RETURNED);
    
    const byTypeMap = collections.reduce((acc, c) => {
      acc[c.payment_type] = (acc[c.payment_type] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const dataByType = Object.keys(byTypeMap).map(key => ({
      name: key,
      value: byTypeMap[key]
    }));

    return { totalCollected, pendingAmount, pendingCount: pendingCheques.length, returnedCount: returnedCheques.length, dataByType };
  }, [collections]);

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Financial Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Total Collected</p>
            <p className="text-xl font-bold dark:text-slate-100">{formatAmount(stats.totalCollected, settings.currency_code)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Pending Cheques</p>
            <p className="text-xl font-bold dark:text-slate-100">{formatAmount(stats.pendingAmount, settings.currency_code)}</p>
            <p className="text-xs text-gray-400">{stats.pendingCount} cheques</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Returned</p>
            <p className="text-xl font-bold dark:text-slate-100">{stats.returnedCount}</p>
            <p className="text-xs text-gray-400">Action Required</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">System Status</p>
            <p className="text-xl font-bold dark:text-slate-100">Healthy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 h-80">
          <h2 className="text-lg font-semibold mb-4 dark:text-slate-100">Collections by Type</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dataByType}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415533" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 h-80">
          <h2 className="text-lg font-semibold mb-4 dark:text-slate-100">Payment Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.dataByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {stats.dataByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;