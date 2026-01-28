import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingAgents } from '../../../services/onboardingService';
import { getListingsByAgent } from '../../../services/listingService';
import { getBookingsByAgent } from '../../../services/bookingService';
import { getLeadsByAgent } from '../../../services/leadService';

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  pendingAgents: number;
  totalListings: number;
  totalBookings: number;
  totalLeads: number;
}

const AdminDashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    pendingAgents: 0,
    totalListings: 0,
    totalBookings: 0,
    totalLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const agents = await getPendingAgents();
        const activeAgents = agents.filter(a => a.status === 'APPROVED').length;
        const pendingAgents = agents.filter(a => a.status === 'PENDING').length;

        // Note: In production, fetch aggregated stats from backend
        // For now, showing agent counts
        setStats({
          totalAgents: agents.length,
          activeAgents,
          pendingAgents,
          totalListings: 0, // Would aggregate from all agents
          totalBookings: 0, // Would aggregate from all agents
          totalLeads: 0, // Would aggregate from all agents
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navigationCards = [
    {
      title: 'Agent Management',
      description: 'Create, approve, and manage agents',
      icon: 'M17 20h5v-2a3 3 0 00-5.856-1.487M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.856-1.487M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 0a1 1 0 11-2 0 1 1 0 012 0zM5 7a1 1 0 11-2 0 1 1 0 012 0z',
      link: '/admin/agents',
      count: stats.totalAgents,
    },
    {
      title: 'Listing Moderation',
      description: 'Review and moderate listings',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      link: '/admin/listings',
      count: stats.totalListings,
    },
    {
      title: 'Subscription Oversight',
      description: 'Manage subscriptions and limits',
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
      link: '/admin/subscriptions',
    },
    {
      title: 'Disputes & Reports',
      description: 'Handle disputes and abuse reports',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      link: '/admin/disputes',
    },
    {
      title: 'Audit Logs',
      description: 'View all admin actions (read-only)',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      link: '/admin/audit-logs',
    },
    {
      title: 'System Settings',
      description: 'Configure features and categories',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M12 15a3 3 0 100-6 3 3 0 000 6z',
      link: '/admin/settings',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview & governance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Agents</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalAgents}</p>
        </div>

        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-6">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Active</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.activeAgents}</p>
        </div>

        <div className="bg-amber-600/10 border border-amber-500/20 rounded-2xl p-4 sm:p-6">
          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Pending</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{stats.pendingAgents}</p>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 sm:p-6">
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Listings</p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-400">{stats.totalListings}</p>
        </div>

        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Bookings</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-400">{stats.totalBookings}</p>
        </div>

        <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 sm:p-6">
          <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2">Leads</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">{stats.totalLeads}</p>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {navigationCards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{card.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{card.description}</p>
                {card.count !== undefined && (
                  <p className="text-xs text-slate-400 mt-2">Total: {card.count}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-10 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-black text-white mb-3">Admin Panel</h3>
        <p className="text-slate-400 text-sm">
          This dashboard provides read-only situational awareness. Use the navigation above to access specific management tools.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
