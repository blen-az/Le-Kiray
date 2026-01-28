import React, { useState } from 'react';

interface Subscription {
  agentId: string;
  agentName: string;
  tier: string;
  status: string;
  daysRemaining: number;
  activeListings: number;
  maxListings: number;
}

const AdminSubscriptionOversight: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const plans = [
    { name: 'STARTER', maxVehicles: 5, price: 'Free' },
    { name: 'STANDARD', maxVehicles: 20, price: '500 ETB/mo' },
    { name: 'PROFESSIONAL', maxVehicles: 100, price: '2000 ETB/mo' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Subscription Oversight</h1>
        <p className="text-slate-500 mt-1">Manage subscriptions and enforce listing limits</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {['all', 'overdue', 'approaching'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Plan Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="font-black text-white mb-2">{plan.name}</p>
            <p className="text-sm text-slate-400">{plan.price}</p>
            <p className="text-xs text-slate-500 mt-2">{plan.maxVehicles} vehicles</p>
          </div>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Days Left</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No subscriptions to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-black text-white mb-3">Subscription Actions</h3>
        <ul className="text-slate-400 text-sm space-y-2">
          <li>✓ Monitor plan usage and enforce limits</li>
          <li>✓ Override subscription status (rare)</li>
          <li>✓ Suspend access for non-payment</li>
          <li>✓ Apply enterprise/custom plans</li>
          <li>✓ Track renewal dates and send alerts</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSubscriptionOversight;
