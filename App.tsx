import React, { useState, useCallback } from 'react';
import { mockCustomers } from './mockData';
import type { Customer } from './types';
import { processCustomerDataFile } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import Header from './components/Header';

type View = 'dashboard' | 'customers';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedCustomer(null);
  }, []);
  
  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result as string;
        if (fileContent) {
          try {
            const newCustomers = await processCustomerDataFile(fileContent);
            setCustomers(newCustomers);
            setView('customers'); // Switch to customer list to show the new data
          } catch (err) {
            console.error(err);
            setProcessingError('AI failed to process the file. Please check the file format and try again.');
          } finally {
            setIsProcessing(false);
          }
        }
      };
      reader.onerror = () => {
        setProcessingError('Failed to read the file.');
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } catch (error) {
      setProcessingError('An unexpected error occurred.');
      setIsProcessing(false);
    }
  }, []);


  const renderContent = () => {
    if (selectedCustomer) {
      // FIX: Removed unused `onBack` prop from `CustomerDetail` to resolve type error.
      // The `Header` component handles the back functionality.
      return <CustomerDetail customer={selectedCustomer} />;
    }
    switch (view) {
      case 'dashboard':
        return <Dashboard customers={customers} onSelectCustomer={handleSelectCustomer} />;
      case 'customers':
        return (
          <CustomerList 
            customers={customers} 
            onSelectCustomer={handleSelectCustomer} 
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
            processingError={processingError}
          />
        );
      default:
        return <Dashboard customers={customers} onSelectCustomer={handleSelectCustomer} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar currentView={view} setView={setView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header customer={selectedCustomer} onBack={handleBackToList}/>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;