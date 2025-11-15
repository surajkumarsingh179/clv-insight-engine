import React, { useState, useMemo, useRef, ChangeEvent } from 'react';
import type { Customer, CustomerSegment } from '../types';
import { MagnifyingGlassIcon, ArrowUpTrayIcon } from './icons/Icons';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  processingError: string | null;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer, onFileUpload, isProcessing, processingError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const filteredCustomers = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.id.toLowerCase().includes(lowercasedFilter) ||
      customer.state.toLowerCase().includes(lowercasedFilter) ||
      customer.policyType.toLowerCase().includes(lowercasedFilter)
    );
  }, [customers, searchTerm]);

  const SEGMENT_COLORS: Record<CustomerSegment, string> = {
    'Champion': 'bg-green-500/20 text-green-400',
    'Loyal': 'bg-blue-500/20 text-blue-400',
    'At Risk': 'bg-orange-500/20 text-orange-400',
    'Lost': 'bg-red-500/20 text-red-400',
    'Newcomer': 'bg-purple-500/20 text-purple-400',
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset file input value to allow uploading the same file again
    event.target.value = '';
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white">Customers</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />
                <button 
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                    <ArrowUpTrayIcon className={`h-5 w-5 ${isProcessing ? 'animate-pulse' : ''}`} />
                    {isProcessing ? 'Processing...' : 'Upload Customer Data'}
                </button>
                 {processingError && <p className="text-xs text-red-400 mt-1 text-center sm:text-right">{processingError}</p>}
                 {!processingError && <p className="text-xs text-gray-500 mt-1 text-center sm:text-right">Upload a .csv file</p>}
            </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Segment</th>
              <th scope="col" className="px-6 py-3">Predicted CLV</th>
              <th scope="col" className="px-6 py-3">Income</th>
              <th scope="col" className="px-6 py-3">Monthly Premium</th>
              <th scope="col" className="px-6 py-3">Policy Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} onClick={() => onSelectCustomer(customer)} className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer">
                <td className="px-6 py-4">
                    <div className="font-medium text-white">{customer.id}</div>
                    <div className="text-gray-500">{customer.state}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${SEGMENT_COLORS[customer.segment]}`}>
                    {customer.segment}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-white">${customer.clvData.clvEstimate.toFixed(2)}</td>
                <td className="px-6 py-4 font-mono">${customer.income.toLocaleString()}</td>
                <td className="px-6 py-4 font-mono">${customer.monthlyPremiumAuto.toFixed(2)}</td>
                <td className="px-6 py-4">{customer.policyType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
