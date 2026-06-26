import React from 'react';
import { SubscriptionPlan } from '../../../types';
import { getSubscriptionUsage, getSubscriptionPlans, createSubscription } from '../../../services/subscriptionService';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

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

  const [selectedMaxVehicles, setSelectedMaxVehicles] = React.useState<number>(5);

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
      case 'trial': return 'blue';
      case 'pending': return 'amber';
      case 'past_due': return 'amber';
      case 'suspended': return 'red';
      default: return 'slate';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] blueprint-grid">
        <div className="w-10 h-10 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-[#F7F9FC] blueprint-grid">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Subscription Plan <span className="text-[#FF8A00] font-medium text-lg px-2.5 py-0.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">Enterprise Billing</span>
        </h1>
        <p className="text-slate-500 mt-1">Manage billing, subscription terms, and fleet vehicle listing limits</p>
      </div>

      {!user.isApproved && (
        <div className="bg-white border-2 border-slate-100 rounded-[28px] p-8 mb-10 text-center shadow-dribbble dots-grid max-w-2xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Account Pending Approval</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your agent account must be approved by the administrator before you can choose a subscription plan and list equipment.
          </p>
        </div>
      )}

      {/* Current Plan */}
      {usage?.subscription ? (
        <div className="bg-white border border-slate-100 rounded-[24px] p-8 mb-10 relative overflow-hidden shadow-dribbble card-premium-glow">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-main/5 blur-[120px] pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row justify-between gap-8 items-start">
            <div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-${getStatusColor(usage.subscription.status)}-50 text-${getStatusColor(usage.subscription.status)}-600 border border-${getStatusColor(usage.subscription.status)}-250/50 inline-block mb-4`}>
                {usage.subscription.status}
              </span>
              {usage.subscription.status === 'pending' && (
                <p className="text-amber-600 text-xs font-bold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Subscription activation request is under review by administration
                </p>
              )}
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{usage.subscription.planName}</h2>
              <p className="text-slate-500 text-xs mt-2">
                Renewal billing executes in <span className="font-extrabold text-slate-900">{usage.daysRemaining} days</span>
              </p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Fleet Slots Utilized</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">
                {usage.activeListings}
                <span className="text-lg text-slate-400 ml-1">/ {usage.subscription.maxVehicles} slots</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="text-slate-400">Total Utilization</span>
              <span className={usage.percentUsed >= 90 ? 'text-red-500' : 'text-brand-main'}>
                {usage.percentUsed}% filled
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-550 ${
                  usage.percentUsed >= 90 ? 'bg-red-500' : 'bg-brand-main'
                }`}
                style={{ width: `${usage.percentUsed}%` }}
              />
            </div>
            {usage.percentUsed >= 80 && (
              <p className="text-[#FF8A00] text-xs font-bold mt-3 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Fleet capacity warning. Consider upgrading machinery slots.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#FF8A00]/5 border border-brand-accent/25 rounded-[24px] p-6 mb-10 text-center max-w-2xl shadow-sm flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0 border border-brand-accent/20">
            <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-slate-900 font-extrabold text-sm">No Active Subscription</h2>
            <p className="text-slate-500 text-xs mt-0.5">Please review the available subscription modules below to activate your Fleet Command listings.</p>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {usage?.subscription ? 'Upgrade Fleet Capacity' : 'Choose Enterprise Plan'}
          </h3>
          
          <div className="bg-white border border-slate-200 p-1 rounded-2xl flex gap-1 shadow-sm w-full md:w-auto">
            {[5, 15, 9999].map((max) => (
              <button
                key={max}
                onClick={() => setSelectedMaxVehicles(max)}
                className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedMaxVehicles === max
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {max === 5 ? 'Basic' : max === 15 ? 'Professional' : 'Enterprise'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[3, 6, 12].map(duration => {
            const durationPlans = plans.filter(p => p.durationMonths === duration);
            const plan = durationPlans.find(p => p.maxVehicles === selectedMaxVehicles) || durationPlans[0];
            
            if (!plan) return null;

            const isCurrentPlan = usage?.subscription?.planId === plan.id;
            const isEnterprise = selectedMaxVehicles === 9999;
            const isPro = selectedMaxVehicles === 15;
            const isBestValue = duration === 12;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white border-2 rounded-[32px] p-8 flex flex-col justify-between transition-all duration-300 shadow-dribbble hover:shadow-dribbble-hover card-premium-glow ${
                  isCurrentPlan
                    ? 'border-brand-main shadow-xl'
                    : 'border-slate-100 hover:border-slate-250'
                }`}
              >
                {isBestValue && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#10B981] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Best Value
                  </div>
                )}

                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                      {isEnterprise ? 'Enterprise' : isPro ? 'Professional' : 'Basic'}
                    </h4>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      isEnterprise ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                      isPro ? 'bg-blue-50 text-brand-main border border-blue-200' : 
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {duration === 12 ? '1 Year' : `${duration} Months`}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8 pt-3 border-t border-slate-50">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{plan.price.toLocaleString()}</span>
                    <span className="text-slate-400 text-xs font-bold uppercase">ETB / {plan.durationMonths === 12 ? 'year' : plan.durationMonths + ' mo'}</span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {isEnterprise ? 'Unlimited fleet size' : `Up to ${plan.maxVehicles} equipment listings`}
                    </li>
                    <li className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Secure quote request routing
                    </li>
                    <li className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Fleet Command Analytics
                    </li>
                  </ul>
                </div>

                <div>
                  {isCurrentPlan ? (
                    <div className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border ${
                      usage?.subscription?.status === 'pending'
                        ? 'bg-amber-50 text-amber-600 border-amber-250/50'
                        : 'bg-blue-50 text-brand-main border-blue-250/50'
                    }`}>
                      {usage?.subscription?.status === 'pending' ? '⌛ Awaiting Verification' : '✓ Current Active Plan'}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={!user.isApproved}
                      className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                        !user.isApproved 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : isPro 
                            ? 'bg-brand-main text-white hover:bg-brand-main/90 shadow-md shadow-brand-main/20 hover:-translate-y-0.5' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {!user.isApproved ? 'Awaiting Verification' : usage?.subscription ? 'Upgrade Plan' : 'Get Started'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
