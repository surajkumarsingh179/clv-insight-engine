
import React from 'react';
import { ChartBarIcon, UsersIcon, SparklesIcon } from './icons/Icons';

type View = 'dashboard' | 'customers';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'customers', label: 'Customers', icon: UsersIcon },
  ];

  return (
    <div className="w-16 md:w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="flex items-center justify-center md:justify-start md:pl-6 h-20 border-b border-gray-700">
         <SparklesIcon className="h-8 w-8 text-blue-400" />
         <span className="hidden md:block ml-3 text-xl font-bold text-gray-100">CLV Engine</span>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`flex items-center justify-center md:justify-start w-full p-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="hidden md:block ml-4">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
