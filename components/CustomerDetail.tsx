import React, { useState, useCallback } from 'react';
import type { Customer, MarketingAction } from '../types';
import { getMarketingRecommendations } from '../services/geminiService';
// FIX: Import Cell from recharts to fix rendering issue in BarChart.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SparklesIcon, InformationCircleIcon } from './icons/Icons';

interface CustomerDetailProps {
  customer: Customer;
}

const InfoCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex-1">
        <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-400">{title}</h4>
            <div className="relative group">
                <InformationCircleIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-gray-600">
                    {description}
                </div>
            </div>
        </div>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
);

const MarketingActionCard: React.FC<{ action: MarketingAction }> = ({ action }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-blue-400">{action.title}</h4>
        <p className="text-sm text-gray-300 mt-1">{action.description}</p>
        <p className="text-xs text-gray-500 mt-2 italic">{action.rationale}</p>
    </div>
);

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer }) => {
    const [recommendations, setRecommendations] = useState<MarketingAction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetRecommendations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRecommendations([]);
        try {
            const result = await getMarketingRecommendations(customer);
            setRecommendations(result);
        } catch (err) {
            setError('Failed to fetch recommendations. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [customer]);
    
    const shapData = customer.clvData.shapValues.map(s => ({...s, color: s.value > 0 ? '#10B981' : '#EF4444'}));

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-400">Predicted Customer Lifetime Value</p>
                        <p className="text-4xl lg:text-5xl font-bold text-white">${customer.clvData.clvEstimate.toFixed(2)}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            95% Confidence Interval: [${customer.clvData.confidenceInterval[0].toFixed(2)} - ${customer.clvData.confidenceInterval[1].toFixed(2)}]
                        </p>
                    </div>
                     <span className={`mt-4 md:mt-0 px-3 py-1.5 text-sm font-medium rounded-full bg-blue-500/20 text-blue-400`}>
                        {customer.segment}
                    </span>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <InfoCard title="Months Since Last Claim" value={customer.monthsSinceLastClaim} description="Proxy for Recency. Lower is better." />
                   <InfoCard title="Number of Policies" value={customer.numberOfPolicies} description="Proxy for Frequency." />
                   <InfoCard title="Monthly Premium" value={`$${customer.monthlyPremiumAuto.toFixed(2)}`} description="Proxy for Monetary Value." />
                   <InfoCard title="Total Claim Amount" value={`$${customer.totalClaimAmount.toFixed(2)}`} description="Total amount claimed by the customer." />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl shadow-lg">
                     <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Marketing Actions</h3>
                     <div className="space-y-4">
                        {!isLoading && !error && recommendations.length === 0 && (
                             <button onClick={handleGetRecommendations} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                <SparklesIcon className="w-5 h-5" />
                                Get AI Recommendations
                            </button>
                        )}
                        {isLoading && <p className="text-center text-gray-400">Generating recommendations...</p>}
                        {error && <p className="text-center text-red-400">{error}</p>}
                        {recommendations.map((action, index) => <MarketingActionCard key={index} action={action} />)}
                     </div>
                </div>
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">CLV Drivers Analysis</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="feature" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={120}/>
                            <Tooltip cursor={{fill: 'rgba(100,116,139,0.1)'}} contentStyle={{backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '0.5rem'}}/>
                            <Bar dataKey="value" name="Impact" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {shapData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
