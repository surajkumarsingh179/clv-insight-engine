import React, { useMemo } from 'react';
import type { Customer, CustomerSegment } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowTrendingUpIcon, CurrencyDollarIcon, UsersIcon } from './icons/Icons';

interface DashboardProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-gray-800 p-6 rounded-xl flex items-center shadow-lg">
        <div className="bg-blue-500/20 p-3 rounded-full">
            <Icon className="h-7 w-7 text-blue-400" />
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ customers, onSelectCustomer }) => {
  const { totalPredictedCLV, avgCLV, segmentCounts } = useMemo(() => {
    const totalCLV = customers.reduce((sum, c) => sum + c.clvData.clvEstimate, 0);
    const avg = customers.length > 0 ? totalCLV / customers.length : 0;
    
    const counts = customers.reduce((acc, c) => {
        acc[c.segment] = (acc[c.segment] || 0) + 1;
        return acc;
    }, {} as Record<CustomerSegment, number>);

    return {
      totalPredictedCLV: totalCLV,
      avgCLV: avg,
      segmentCounts: Object.entries(counts).map(([name, value]) => ({ name, value })),
    };
  }, [customers]);

  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.clvData.clvEstimate - a.clvData.clvEstimate)
      .slice(0, 5);
  }, [customers]);

  const COLORS: Record<CustomerSegment, string> = {
    'Champion': '#10B981', // green-500
    'Loyal': '#3B82F6', // blue-500
    'At Risk': '#F97316', // orange-500
    'Lost': '#EF4444', // red-500
    'Newcomer': '#A855F7', // purple-500
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Predicted CLV" value={`$${(totalPredictedCLV / 1000).toFixed(1)}k`} icon={CurrencyDollarIcon} />
        <StatCard title="Average Customer CLV" value={`$${avgCLV.toFixed(2)}`} icon={ArrowTrendingUpIcon} />
        <StatCard title="Total Customers" value={customers.length.toString()} icon={UsersIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">CLV Distribution by Customer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCustomers} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="id" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`}/>
              <Tooltip cursor={{fill: 'rgba(100,116,139,0.1)'}} contentStyle={{backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '0.5rem'}}/>
              <Bar dataKey="clvData.clvEstimate" name="CLV" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={segmentCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                {segmentCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as CustomerSegment]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '0.5rem'}}/>
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Top Value Customers</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Customer ID</th>
                            <th scope="col" className="px-6 py-3">State</th>
                            <th scope="col" className="px-6 py-3">Segment</th>
                            <th scope="col" className="px-6 py-3">Predicted CLV</th>
                            <th scope="col" className="px-6 py-3">Income</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topCustomers.map((customer) => (
                            <tr key={customer.id} onClick={() => onSelectCustomer(customer)} className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer">
                                <td className="px-6 py-4 font-medium text-white">{customer.id}</td>
                                <td className="px-6 py-4">{customer.state}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full`} style={{backgroundColor: `${COLORS[customer.segment]}30`, color: COLORS[customer.segment]}}>{customer.segment}</span></td>
                                <td className="px-6 py-4 font-mono">${customer.clvData.clvEstimate.toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono">${customer.income.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
