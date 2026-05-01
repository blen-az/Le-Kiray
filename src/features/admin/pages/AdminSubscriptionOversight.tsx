import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { getAllSubscriptions, updateSubscriptionStatus } from '../../../services/subscriptionService';
import { SubscriptionStatus } from '../../../types';

const AdminSubscriptionOversight: React.FC = () => {
 const queryClient = useQueryClient();
 const [filter, setFilter] = useState('all');

 const [subscriptions, setSubscriptions] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 setLoading(true);

 const q = query(collection(db, 'subscriptions'));
 
 const unsubscribe = onSnapshot(q, (snapshot: any) => {
 const subs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
 // Sort in memory to avoid index requirement
 subs.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
 setSubscriptions(subs);
 setLoading(false);
 setError(null);
 }, (err: any) => {
 console.error('Error fetching subscriptions:', err);
 setError(err.message || 'Failed to fetch subscriptions. Ensure you are logged in as an Admin.');
 setLoading(false);
 });

 return () => unsubscribe();
 }, []);

 const updateStatusMutation = useMutation({
 mutationFn: ({ id, status }: { id: string; status: SubscriptionStatus }) => 
 updateSubscriptionStatus(id, status),
 onSuccess: () => {
 alert('Subscription status updated successfully!');
 },
 onError: (error: any) => {
 console.error('Mutation error:', error);
 alert(`Failed to update subscription: ${error.message || 'Unknown error'}. Check if you have Admin permissions in Custom Claims.`);
 }
 });

 const handleStatusChange = (id: string, status: SubscriptionStatus) => {
 if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
 updateStatusMutation.mutate({ id, status });
 }
 };

 const filteredSubscriptions = subscriptions.filter(sub => {
 if (filter === 'all') return true;
 if (filter === 'pending') return sub.status === 'pending';
 if (filter === 'active') return sub.status === 'active';
 return true;
 });

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
 {['all', 'pending', 'active'].map((f) => (
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

 {/* Error Display */}
 {error && (
 <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
 <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
 <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 </div>
 <div>
 <h3 className="font-bold text-white">Data Fetching Error</h3>
 <p className="text-sm text-slate-400 mt-1">{error}</p>
 <p className="text-[10px] text-red-400 mt-2 font-black uppercase tracking-widest">
 Please try logging out and back in to refresh your Admin credentials.
 </p>
 </div>
 </div>
 )}

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
 <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr>
 <td colSpan={6} className="px-6 py-8 text-center">
 <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
 </td>
 </tr>
 ) : filteredSubscriptions.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
 No subscriptions to display
 </td>
 </tr>
 ) : (
 filteredSubscriptions.map(sub => (
 <tr key={sub.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
 <td className="px-6 py-4">
 <p className="font-bold text-white text-sm">{sub.agentName}</p>
 <p className="text-[10px] text-slate-400 font-medium tracking-wide">{sub.agentEmail}</p>
 <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 opacity-50">{sub.agentId}</p>
 </td>
 <td className="px-6 py-4">
 <p className="text-white text-sm font-medium">{sub.planName}</p>
 </td>
 <td className="px-6 py-4">
 <p className="text-white text-sm font-bold">{sub.activeListingCount} / {sub.maxVehicles}</p>
 </td>
 <td className="px-6 py-4">
 <p className="text-slate-400 text-sm">{Math.ceil((new Date(sub.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days</p>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
 sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
 sub.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
 'bg-red-500/10 text-red-500'
 }`}>
 {sub.status}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 {sub.status === 'pending' && (
 <button 
 onClick={() => handleStatusChange(sub.id, 'active')}
 className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg"
 >
 Approve
 </button>
 )}
 {sub.status !== 'suspended' ? (
 <button 
 onClick={() => handleStatusChange(sub.id, 'suspended')}
 className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-[10px] font-black uppercase border border-red-500/20 rounded-lg"
 >
 Suspend
 </button>
 ) : (
 <button 
 onClick={() => handleStatusChange(sub.id, 'active')}
 className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase rounded-lg"
 >
 Reactivate
 </button>
 )}
 </div>
 </td>
 </tr>
 ))
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
