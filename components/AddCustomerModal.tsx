import React, { useState } from 'react';
import type { Customer } from '../types';
import { processSingleCustomer } from '../services/geminiService';
import { SparklesIcon } from './icons/Icons';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: Customer) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAddCustomer }) => {
  const [formData, setFormData] = useState({
    id: '',
    state: '',
    coverage: 'Basic',
    education: 'Bachelor',
    income: '',
    monthlyPremiumAuto: '',
    monthsSinceLastClaim: '',
    numberOfPolicies: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    try {
      const partialCustomer = {
        id: formData.id,
        state: formData.state,
        coverage: formData.coverage,
        education: formData.education,
        income: Number(formData.income),
        monthlyPremiumAuto: Number(formData.monthlyPremiumAuto),
        monthsSinceLastClaim: Number(formData.monthsSinceLastClaim),
        numberOfPolicies: Number(formData.numberOfPolicies),
      };
      const newCustomer = await processSingleCustomer(partialCustomer as Partial<Customer>);
      onAddCustomer(newCustomer);
      onClose();
      // Reset form for next time
      setFormData({
        id: '', state: '', coverage: 'Basic', education: 'Bachelor',
        income: '', monthlyPremiumAuto: '', monthsSinceLastClaim: '', numberOfPolicies: '',
      });
    } catch (err) {
      setError('AI failed to process customer data. Please check the values and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="id" placeholder="Customer ID" value={formData.id} onChange={handleChange} required className="input-field" />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="coverage" value={formData.coverage} onChange={handleChange} className="input-field">
              <option>Basic</option>
              <option>Extended</option>
              <option>Premium</option>
            </select>
            <select name="education" value={formData.education} onChange={handleChange} className="input-field">
              <option>High School or Below</option>
              <option>Bachelor</option>
              <option>College</option>
              <option>Master</option>
              <option>Doctor</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" name="income" placeholder="Annual Income" value={formData.income} onChange={handleChange} required className="input-field" />
            <input type="number" name="monthlyPremiumAuto" placeholder="Monthly Premium" value={formData.monthlyPremiumAuto} onChange={handleChange} required className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" name="monthsSinceLastClaim" placeholder="Months Since Last Claim" value={formData.monthsSinceLastClaim} onChange={handleChange} required className="input-field" />
            <input type="number" name="numberOfPolicies" placeholder="Number of Policies" value={formData.numberOfPolicies} onChange={handleChange} required className="input-field" />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div className="flex justify-end items-center pt-4 gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" disabled={isProcessing} className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-800 disabled:cursor-not-allowed">
              <SparklesIcon className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Add Customer'}
            </button>
          </div>
        </form>
        <style>{`.input-field { background-color: #374151; border: 1px solid #4B5563; border-radius: 0.5rem; padding: 0.75rem 1rem; color: white; width: 100%; } .input-field:focus { outline: none; border-color: #3B82F6; ring: 1px solid #3B82F6; }`}</style>
      </div>
    </div>
  );
};

export default AddCustomerModal;
