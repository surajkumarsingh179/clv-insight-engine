import React from 'react';
import type { Customer } from '../types';
import { ChevronLeftIcon, UserCircleIcon } from './icons/Icons';

interface HeaderProps {
  customer: Customer | null;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ customer, onBack }) => {
  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-gray-900 border-b border-gray-700 flex-shrink-0">
      <div className="flex items-center">
        {customer ? (
          <>
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 mr-4 transition-colors">
                <ChevronLeftIcon className="h-6 w-6 text-gray-300"/>
            </button>
            <div>
                <h1 className="text-xl font-semibold text-white">Customer: {customer.id}</h1>
                <p className="text-sm text-gray-400">Customer Details</p>
            </div>
          </>
        ) : (
          <h1 className="text-xl font-semibold text-white">Dashboard Overview</h1>
        )}
      </div>
      <div className="flex items-center">
        <UserCircleIcon className="h-8 w-8 text-gray-400" />
      </div>
    </header>
  );
};

export default Header;
