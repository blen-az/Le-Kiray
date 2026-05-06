import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { updateSubscriptionStatus, adminOverridePlan, getSubscriptionPlans } from '../../../services/subscriptionService';
import { SubscriptionStatus } from '../../../types';

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  past_due: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const AdminSubscriptionOversight: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [overrideTarget, setOverrideTarget] = useState<{ id: string; agentName: string } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Live subscriptions via onSnapshot
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'subscriptions'));
    const unsub = onSnapshot(q, (snap: any) => {
      const subs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      subs.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setSubscriptions(subs);
      setLoading(false);
      setError(null);
    }, (err: any) => {
      setError(err.message || 'Failed to load subscriptions.');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const { data: plans = [] } = useQuery({ queryKey: ['sub-plans'], queryFn: getSubscriptionPlans });
  const machineryPlans = plans.filter((p: any) => p.category !== 'CONSUMER' && p.category !== 'CARS_VANS');

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubscriptionStatus }) =>
      updateSubscriptionStatus(id, status),
    onError: (e: any) => alert(`Error: ${e.message}`),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, planId }: { id: string; planId: string }) =>
      adminOverridePlan(id, planId),
    onSuccess: () => {
      setOverrideTarget(null);
      setSelectedPlanId('');
    },
    onError: (e: any) => alert(`Override failed: ${e.message}`),
  });

  const filtered = subscriptions.filter((s: any) => filter === 'all' || s.status === filter);

  const counts = {
    all: subscriptions.length,
    pending: subscriptions.filter((s: any) => s.status === 'pending').length,
    active: subscriptions.filter((s: any) => s.status === 'active').length,
    suspended: subscriptions.filter((s: any) => s.status === 'suspended').length,
  };

  const daysLeft = (end: string) =>
    Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Subscription Oversight</h1>
          <p className="text-slate-500 mt-1">Approve, suspend, and override agent plans</p>
        </div>
        {counts.pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-bold">{counts.pending} awaiting approval</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.all, color: 'text-white', border: 'border-slate-800' },
          { label: 'Active', value: counts.active, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Suspended', value: counts.suspended, color: 'text-red-400', border: 'border-red-500/20' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-slate-900 border ${border} rounded-2xl p-4`}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Object.entries(counts).map(([tab, count]) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${filter === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${filter === tab ? 'bg-white/20' : 'bg-slate-700'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Expires</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No subscriptions to display.</td></tr>
              ) : filtered.map((sub: any) => {
                const days = daysLeft(sub.currentPeriodEnd);
                const isExpiringSoon = days > 0 && days <= 7;
                return (
                  <tr key={sub.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm">{sub.agentName}</p>
                      <p className="text-slate-500 text-xs">{sub.agentEmail}</p>
                      {sub.overriddenByAdmin && (
                        <span className="text-[9px] text-indigo-400 font-black uppercase">⚡ Admin Override</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">{sub.planName}</td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-bold">{sub.activeListingCount ?? 0} / {sub.maxVehicles}</p>
                      <div className="mt-1 h-1.5 w-24 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${sub.maxVehicles > 0 ? Math.min(100, ((sub.activeListingCount ?? 0) / sub.maxVehicles) * 100) : 0}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-bold ${days < 0 ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-slate-400'}`}>
                        {days < 0 ? 'Expired' : `${days}d`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLE[sub.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {sub.status === 'pending' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: sub.id, status: 'active' })}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {sub.status !== 'suspended' ? (
                          <button
                            onClick={() => {
                              if (window.confirm('Suspend this subscription?')) {
                                statusMutation.mutate({ id: sub.id, status: 'suspended' });
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[10px] font-black uppercase border border-red-500/20 rounded-lg transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => statusMutation.mutate({ id: sub.id, status: 'active' })}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                          >
                            Reinstate
                          </button>
                        )}
                        <button
                          onClick={() => { setOverrideTarget({ id: sub.id, agentName: sub.agentName }); setSelectedPlanId(''); }}
                          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase border border-indigo-500/20 rounded-lg transition-colors"
                        >
                          Override Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Override Modal */}
      {overrideTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOverrideTarget(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-white">Override Plan</h2>
                <p className="text-slate-400 text-sm mt-1">{overrideTarget.agentName}</p>
              </div>
              <button onClick={() => setOverrideTarget(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <p className="text-slate-500 text-sm mb-5">Select a plan to immediately assign. The subscription will be set to <strong className="text-white">Active</strong> and the period restarted.</p>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-1">
              {machineryPlans.map((plan: any) => (
                <label
                  key={plan.id}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedPlanId === plan.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="plan" value={plan.id} checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id)} className="accent-indigo-500" />
                    <div>
                      <p className="text-white text-sm font-bold">{plan.name}</p>
                      <p className="text-slate-500 text-xs">{plan.maxVehicles === 9999 ? 'Unlimited' : `${plan.maxVehicles} machineries`}</p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-sm font-bold">{plan.price.toLocaleString()} ETB</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                if (!selectedPlanId) return alert('Select a plan first.');
                if (window.confirm('Override this agent\'s subscription plan immediately?')) {
                  overrideMutation.mutate({ id: overrideTarget.id, planId: selectedPlanId });
                }
              }}
              disabled={overrideMutation.isPending || !selectedPlanId}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {overrideMutation.isPending ? 'Applying...' : 'Apply Override'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionOversight;
