import React, { useMemo } from 'react';
import { Collection, CollectionStatus, PaymentType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, CreditCard, AlertTriangle, Activity } from 'lucide-react';

interface DashboardProps {
  collections: Collection[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC<DashboardProps> = ({ collections }) => {
  
  const stats = useMemo(() => {
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
    const pendingCheques = collections.filter(c => c.payment_type === PaymentType.CHEQUE && c.status === CollectionStatus.PENDING);
    const pendingAmount = pendingCheques.reduce((sum, c) => sum + c.amount, 0);
    const returnedCheques = collections.filter(c => c.status === CollectionStatus.RETURNED);
    
    // Group by type for Pie Chart
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
      <h1 className="text-2xl font-bold text-gray-800">Financial Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-xl font-bold">${stats.totalCollected.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Cheques</p>
            <p className="text-xl font-bold">${stats.pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{stats.pendingCount} cheques</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Returned</p>
            <p className="text-xl font-bold">{stats.returnedCount}</p>
            <p className="text-xs text-gray-400">Action Required</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">System Status</p>
            <p className="text-xl font-bold">Healthy</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h2 className="text-lg font-semibold mb-4">Collections by Type</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dataByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h2 className="text-lg font-semibold mb-4">Payment Distribution</h2>
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
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
