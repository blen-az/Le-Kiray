import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPendingAgents } from '../../../services/onboardingService';
import { getAllAdminListings } from '../../../services/listingService';
import { getAllLeadsAdmin } from '../../../services/leadService';

const AdminDashboardOverview: React.FC = () => {
  const { data: agents = [] } = useQuery({ queryKey: ['admin-agents'], queryFn: getPendingAgents });
  const { data: listings = [] } = useQuery({ queryKey: ['admin-listings'], queryFn: getAllAdminListings });
  const { data: leads = [] } = useQuery({ queryKey: ['admin-leads'], queryFn: getAllLeadsAdmin });

  const stats = {
    totalAgents: agents.length,
    approved: agents.filter((a: any) => a.isApproved && !a.isSuspended).length,
    pendingApproval: agents.filter((a: any) => !a.isApproved && !a.isSuspended).length,
    suspended: agents.filter((a: any) => a.isSuspended).length,
    totalListings: listings.length,
    pendingListings: listings.filter((l: any) => l.status === 'pending_review').length,
    activeListings: listings.filter((l: any) => l.status === 'active').length,
    totalLeads: leads.length,
    newLeads: leads.filter((l: any) => l.status === 'new').length,
    wonLeads: leads.filter((l: any) => l.status === 'won').length,
  };

  const winRate = stats.totalLeads > 0 ? Math.round((stats.wonLeads / stats.totalLeads) * 100) : 0;

  const urgentActions = [
    stats.pendingApproval > 0 && {
      label: `${stats.pendingApproval} agent${stats.pendingApproval > 1 ? 's' : ''} awaiting account approval`,
      link: '/admin/agents',
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
      icon: '👤',
    },
    stats.pendingListings > 0 && {
      label: `${stats.pendingListings} listing${stats.pendingListings > 1 ? 's' : ''} pending review`,
      link: '/admin/listings',
      color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',
      icon: '🏗️',
    },
    stats.newLeads > 0 && {
      label: `${stats.newLeads} new quote request${stats.newLeads > 1 ? 's' : ''} submitted`,
      link: '/admin/leads',
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
      icon: '📋',
    },
  ].filter(Boolean) as { label: string; link: string; color: string; icon: string }[];

  const navigationCards = [
    {
      title: 'Agent Management',
      description: 'Approve, suspend and manage agents',
      icon: 'M17 20h5v-2a3 3 0 00-5.856-1.487M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.856-1.487M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      link: '/admin/agents',
      badge: stats.pendingApproval > 0 ? `${stats.pendingApproval} pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      title: 'Listing Moderation',
      description: 'Approve and moderate machinery listings',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      link: '/admin/listings',
      badge: stats.pendingListings > 0 ? `${stats.pendingListings} pending` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      title: 'Subscription Oversight',
      description: 'Approve subscriptions and enforce limits',
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
      link: '/admin/subscriptions',
    },
    {
      title: 'Booking Requests',
      description: 'Monitor platform-wide lead activity',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      link: '/admin/leads',
      badge: stats.newLeads > 0 ? `${stats.newLeads} new` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-400',
    },
    {
      title: 'Disputes & Reports',
      description: 'Handle disputes and abuse reports',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      link: '/admin/disputes',
    },
    {
      title: 'Audit Logs',
      description: 'Track all admin actions',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      link: '/admin/audit-logs',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview & governance</p>
      </div>

      {/* Urgent Action Alerts */}
      {urgentActions.length > 0 && (
        <div className="space-y-3 mb-8">
          {urgentActions.map((action) => (
            <Link
              key={action.link}
              to={action.link}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-opacity hover:opacity-80 ${action.color}`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="font-bold text-sm flex-1">{action.label}</span>
              <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Agents', value: stats.totalAgents, sub: `${stats.approved} approved`, color: 'text-white', border: 'border-slate-800' },
          { label: 'Active Listings', value: stats.activeListings, sub: `${stats.pendingListings} pending review`, color: 'text-indigo-400', border: 'border-indigo-500/20' },
          { label: 'Total Leads', value: stats.totalLeads, sub: `${winRate}% win rate`, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Approved Agents', value: stats.approved, sub: `${stats.suspended} suspended`, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'New Quotes', value: stats.newLeads, sub: 'Awaiting agent response', color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'Won Deals', value: stats.wonLeads, sub: `Out of ${stats.totalLeads} total`, color: 'text-amber-400', border: 'border-amber-500/20' },
        ].map(({ label, value, sub, color, border }) => (
          <div key={label} className={`bg-slate-900 border ${border} rounded-2xl p-4 sm:p-6`}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl sm:text-3xl font-black ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navigationCards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{card.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{card.description}</p>
                </div>
              </div>
              {card.badge && (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
