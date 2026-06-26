import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Booking, QuoteRequest } from '../../../types';
import { getBookingsByAgent } from '../../../services/bookingService';
import { getLeadsByAgent, countNewLeads } from '../../../services/leadService';
import { getSubscriptionUsage } from '../../../services/subscriptionService';
import { useAuth } from '../../../features/auth/context/AuthContext';

const AgentDashboard: React.FC = () => {
 const { currentUser: user } = useAuth();
 
 if (!user) return null;
 const { data, isLoading: loading } = useQuery({
 queryKey: ['agent-dashboard', user.id],
 queryFn: async () => {
 const [usage, bookings, leads, newLeadCount] = await Promise.all([
 getSubscriptionUsage(user.id),
 getBookingsByAgent(user.id),
 getLeadsByAgent(user.id),
 countNewLeads(user.id),
 ]);
 const pendingBookings = bookings.filter(b => b.status === 'pending').length;
 
 return {
 stats: {
 activeListings: usage.activeListings,
 maxListings: usage.subscription?.maxVehicles || 0,
 pendingBookings,
 newLeads: newLeadCount,
 daysRemaining: usage.daysRemaining,
 },
 recentBookings: bookings.slice(0, 3),
 recentLeads: leads.slice(0, 3),
 };
 }
 });

 const stats = data?.stats || {
 activeListings: 0,
 maxListings: 0,
 pendingBookings: 0,
 newLeads: 0,
 daysRemaining: 0,
 };
 const recentBookings = data?.recentBookings || [];
 const recentLeads = data?.recentLeads || [];

 if (loading) {
 return (
 <div className="flex items-center justify-center h-full">
 <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
    <div className="p-8 min-h-screen bg-[#F7F9FC] blueprint-grid">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Fleet Overview <span className="text-[#FF8A00] font-medium text-lg px-2.5 py-0.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">Active</span>
          </h1>
          <p className="text-slate-500 mt-1">Real-time status, bookings, and lead generation analytics for your construction equipment fleet.</p>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="space-y-4 mb-8 md:mb-10">
        {!user.isApproved && (
          <div className="relative overflow-hidden bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF8A00]" />
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Account Pending Approval</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your agent profile is under review by the administrator. You can prepare your fleet by saving listings as drafts, but you can only publish them once your account is approved.
              </p>
            </div>
          </div>
        )}

        {user.isApproved && !data?.stats.maxListings && (
          <div className="relative overflow-hidden bg-brand-main/5 border border-brand-main/10 rounded-3xl p-6 flex items-start justify-between gap-4 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-main" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-main/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2-2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Subscription Required</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You need an active subscription plan to publish machinery listings on the live marketplace directory.
                </p>
              </div>
            </div>
            <Link 
              to="/agent/subscription"
              className="px-5 py-2.5 bg-brand-main hover:bg-brand-main/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-main/20 whitespace-nowrap"
            >
              Choose Plan
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-dribbble card-premium-glow flex flex-col justify-between">
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Fleet Capacity</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.activeListings}
              <span className="text-sm font-bold text-slate-400 ml-1">/ {stats.maxListings} active</span>
            </p>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-main rounded-full transition-all duration-500"
                style={{ width: `${stats.maxListings > 0 ? (stats.activeListings / stats.maxListings) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-slate-900 to-slate-950 rounded-3xl p-6 shadow-dribbble flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#FF8A00]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Pending Bookings</p>
            <p className="text-3xl font-black text-white tracking-tight">{stats.pendingBookings}</p>
          </div>
          <Link to="/agent/bookings" className="text-[10px] font-black uppercase tracking-wider text-brand-accent hover:text-brand-accent/90 transition-colors mt-4 block">
            Manage Queue →
          </Link>
        </div>

        <div className="bg-gradient-to-tr from-brand-main to-blue-700 rounded-3xl p-6 shadow-dribbble flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div>
            <p className="text-[9px] font-extrabold text-blue-100 uppercase tracking-widest mb-1">New Inquiries</p>
            <p className="text-3xl font-black text-white tracking-tight">{stats.newLeads}</p>
          </div>
          <Link to="/agent/leads" className="text-[10px] font-black uppercase tracking-wider text-white hover:underline mt-4 block">
            Review Leads →
          </Link>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-dribbble card-premium-glow flex flex-col justify-between">
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Billing Period</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.daysRemaining}
              <span className="text-xs font-bold text-slate-400 ml-1">days left</span>
            </p>
          </div>
          <Link to="/agent/subscription" className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-800 transition-colors mt-4 block">
            Manage Plan →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 sm:mb-10">
        <Link 
          to="/agent/listings/new"
          className="bg-white border border-slate-100 hover:border-brand-main/30 rounded-3xl p-6 flex items-center gap-6 transition-all shadow-dribbble hover:shadow-dribbble-hover group card-premium-glow"
        >
          <div className="w-14 h-14 shrink-0 bg-brand-main/5 border border-brand-main/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-main/10 transition-colors">
            <svg className="w-6 h-6 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Add New Asset</h3>
            <p className="text-xs text-slate-500 mt-1">List excavators, loaders, dozers, dump trucks, or compactors</p>
          </div>
        </Link>
        <Link 
          to="/agent/fleet"
          className="bg-white border border-slate-100 hover:border-brand-main/30 rounded-3xl p-6 flex items-center gap-6 transition-all shadow-dribbble hover:shadow-dribbble-hover group card-premium-glow"
        >
          <div className="w-14 h-14 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Manage Fleet Command</h3>
            <p className="text-xs text-slate-500 mt-1">Update specifications, verify availability, or archive listings</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-dribbble space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Messages</h3>
            <Link to="/agent/messages" className="text-xs font-bold text-brand-main hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-brand-main text-white rounded-xl flex items-center justify-center font-black shadow-sm">J</div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-xs truncate">John Doe</p>
                <p className="text-[11px] text-slate-500 truncate font-medium">I'm interested in the excavator...</p>
              </div>
              <div className="w-2.5 h-2.5 bg-brand-main rounded-full animate-pulse" />
            </div>
            <p className="text-center text-[9px] font-extrabold text-slate-400 uppercase tracking-widest py-2">Secure Direct Messaging Active</p>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-dribbble space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Leads</h3>
            <Link to="/agent/leads" className="text-xs font-bold text-[#FF8A00] hover:underline">
              View All
            </Link>
          </div>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100/50 transition-colors">
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">{lead.listingName}</p>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                      {lead.consumerName} • {lead.projectLocation}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                    lead.status === 'new' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    lead.status === 'quoted' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No leads yet</p>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-dribbble space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Bookings</h3>
            <Link to="/agent/bookings" className="text-xs font-bold text-brand-main hover:underline">
              View All
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100/50 transition-colors">
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">{booking.listingName}</p>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                      {booking.startDate} - {booking.endDate}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                    booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-250' :
                    booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-250' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
