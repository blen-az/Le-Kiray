import React from 'react';
import { Subscription, SubscriptionPlan } from '../../../types';
import { getSubscriptionUsage, getSubscriptionPlans, createSubscription } from '../../../services/subscriptionService';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SubscriptionPage: React.FC = () => {
 const { currentUser: user } = useAuth();
 const agentId = user?.id || '';
 
 if (!user) return null;
 const queryClient = useQueryClient();

 const { data, isLoading: loading } = useQuery({
 queryKey: ['subscriptionUsage', agentId],
 queryFn: async () => {
 const [usageData, plansData] = await Promise.all([
 getSubscriptionUsage(agentId),
 getSubscriptionPlans(),
 ]);
 return { usage: usageData, plans: plansData };
 },
 enabled: !!agentId,
 });

 const usage = data?.usage || null;
 const plans = (data?.plans || []).filter(p => p.category !== 'CONSUMER');

 const selectPlanMutation = useMutation({
 mutationFn: (planId: string) => createSubscription(agentId, user?.name || 'Unknown Agent', user?.email || '', planId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['subscriptionUsage', agentId] });
 },
 });

 const handleSelectPlan = async (planId: string) => {
 selectPlanMutation.mutate(planId);
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active': return 'emerald';
 case 'trial': return 'indigo';
 case 'pending': return 'amber';
 case 'past_due': return 'amber';
 case 'suspended': return 'red';
 default: return 'slate';
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-full">
 <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="p-8">
 {/* Header */}
 <div className="mb-10">
 <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription</h1>
 <p className="text-slate-500 mt-1">Manage your plan and fleet limits</p>
 </div>

 {/* Current Plan */}
 {usage?.subscription ? (
 <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-10 relative overflow-hidden shadow-sm">
 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]" />
 <div className="relative flex flex-col lg:flex-row justify-between gap-8">
 <div>
 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${getStatusColor(usage.subscription.status)}-500/10 text-${getStatusColor(usage.subscription.status)}-500 border border-${getStatusColor(usage.subscription.status)}-500/20 inline-block mb-4`}>
 {usage.subscription.status}
 </span>
 {usage.subscription.status === 'pending' && (
 <p className="text-amber-500 text-xs font-bold mb-4 flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Subscription request is being reviewed by admin
 </p>
 )}
 <h2 className="text-2xl font-black text-slate-900 ">{usage.subscription.planName}</h2>
 <p className="text-slate-500 mt-2">
 Renews in {usage.daysRemaining} days
 </p>
 </div>
 <div className="text-left lg:text-right">
 <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Fleet Usage</p>
 <p className="text-4xl font-black text-slate-900 ">
 {usage.activeListings}<span className="text-lg text-slate-500">/{usage.subscription.maxVehicles}</span>
 </p>
 </div>
 </div>

 <div className="mt-8 pt-8 border-t border-slate-200 ">
 <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
 <span className="text-slate-500">Capacity</span>
 <span className={usage.percentUsed >= 90 ? 'text-red-500' : 'text-indigo-500 '}>
 {usage.percentUsed}% used
 </span>
 </div>
 <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all ${
 usage.percentUsed >= 90 ? 'bg-red-500' : 'bg-indigo-600'
 }`}
 style={{ width: `${usage.percentUsed}%` }}
 />
 </div>
 {usage.percentUsed >= 80 && (
 <p className="text-amber-500 text-xs font-bold mt-3 flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 You're running low on slots. Consider upgrading your plan.
 </p>
 )}
 </div>
 </div>
 ) : (
 <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 mb-10 text-center">
 <h2 className="text-xl font-black text-slate-900 mb-2">No Active Subscription</h2>
 <p className="text-slate-500 ">Select a plan below to start listing your fleet.</p>
 </div>
 )}

 {/* Available Plans */}
 <div>
 <h3 className="text-xl font-black text-slate-900 mb-6">
 {usage?.subscription ? 'Upgrade Your Plan' : 'Choose a Plan'}
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {plans.map(plan => {
 const isCurrentPlan = usage?.subscription?.planId === plan.id;
 const isCarsVans = plan.category === 'CARS_VANS';
 
 return (
 <div 
 key={plan.id}
 className={`bg-white border rounded-2xl p-6 flex flex-col transition-all shadow-sm ${
 isCurrentPlan
 ? 'border-indigo-500'
 : 'border-slate-200 hover:border-slate-300 '
 }`}
 >
 <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest self-start mb-4 ${
 isCarsVans ? 'bg-indigo-500/10 text-indigo-600 ' : 'bg-amber-500/10 text-amber-600 '
 }`}>
 {isCarsVans ? 'Cars & Vans' : 'Earth Moving'}
 </span>
 
 <h4 className="text-lg font-black text-slate-900 mb-2">{plan.name}</h4>
 
 <div className="flex items-end gap-1 mb-4">
 <span className="text-3xl font-black text-slate-900 ">{plan.price.toLocaleString()}</span>
 <span className="text-slate-500 text-sm font-bold mb-1">ETB / {plan.durationMonths === 12 ? 'yr' : plan.durationMonths + ' mo'}</span>
 </div>

 <ul className="space-y-2 mb-6 flex-1">
 <li className="flex items-center gap-2 text-sm text-slate-500 ">
 <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 </svg>
 Up to {plan.maxVehicles === 9999 ? 'Unlimited' : plan.maxVehicles} vehicles
 </li>
 <li className="flex items-center gap-2 text-sm text-slate-500 ">
 <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 </svg>
 {isCarsVans ? 'Instant Bookings' : 'Quote Requests'}
 </li>
 <li className="flex items-center gap-2 text-sm text-slate-500 ">
 <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 </svg>
 Analytics Dashboard
 </li>
 </ul>

 {isCurrentPlan ? (
 <span className="w-full py-3 bg-indigo-600/20 text-indigo-600 rounded-xl text-sm font-bold text-center">
 Current Plan
 </span>
 ) : (
 <button
 onClick={() => handleSelectPlan(plan.id)}
 className="w-full py-3 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-sm font-bold transition-colors"
 >
 {usage?.subscription ? 'Upgrade' : 'Select Plan'}
 </button>
 )}
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
};

export default SubscriptionPage;
