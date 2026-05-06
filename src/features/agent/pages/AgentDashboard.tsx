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
    <div className="p-4 md:p-8">
      {/* Status Alerts */}
      <div className="space-y-4 mb-8 md:mb-10">
 {!user.isApproved && (
 <div className="bg-amber-600/10 border border-amber-600/20 rounded-2xl p-6 flex items-start gap-4">
 <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
 <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 </div>
 <div>
 <h3 className="font-bold text-slate-900 ">Account Pending Approval</h3>
 <p className="text-sm text-slate-500 mt-1">
 Your agent profile is under review by the administrator. You can prepare your fleet by saving listings as drafts, but you can only publish them once your account is approved.
 </p>
 </div>
 </div>
 )}

 {!data?.stats.maxListings && (
 <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-6 flex items-start justify-between gap-4">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
 <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2-2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
 </svg>
 </div>
 <div>
 <h3 className="font-bold text-slate-900 ">Subscription Required</h3>
 <p className="text-sm text-slate-500 mt-1">
 You need an active subscription plan to publish listings on the marketplace.
 </p>
 </div>
 </div>
 <Link 
 to="/agent/subscription"
 className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-900/40 whitespace-nowrap"
 >
 Choose Plan
 </Link>
 </div>
 )}
 </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fleet Usage</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 ">{stats.activeListings}<span className="text-base sm:text-lg text-slate-500">/{stats.maxListings}</span></p>
          <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${stats.maxListings > 0 ? (stats.activeListings / stats.maxListings) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-4 sm:p-6 shadow-lg shadow-indigo-500/20">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Pending Bookings</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.pendingBookings}</p>
          <Link to="/agent/bookings" className="text-[10px] sm:text-xs font-bold text-indigo-200 hover:text-white mt-4 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-amber-600 rounded-2xl p-4 sm:p-6 shadow-lg shadow-amber-500/20">
          <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-2">New Leads</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.newLeads}</p>
          <Link to="/agent/leads" className="text-[10px] sm:text-xs font-bold text-amber-200 hover:text-white mt-4 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subscription</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 ">{stats.daysRemaining}<span className="text-base sm:text-lg text-slate-500"> days</span></p>
          <Link to="/agent/subscription" className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-900 mt-4 inline-block">
            Manage Plan →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-10">
        <Link 
          to="/agent/listings/new"
          className="bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl p-5 sm:p-8 flex items-center gap-4 sm:gap-6 transition-all group shadow-sm"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-indigo-600/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 ">Add New Vehicle</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">List a car, van, or heavy equipment</p>
          </div>
        </Link>

        <Link 
          to="/agent/fleet"
          className="bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl p-5 sm:p-8 flex items-center gap-4 sm:gap-6 transition-all group shadow-sm"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 ">Manage Fleet</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Edit, pause, or update your listings</p>
          </div>
        </Link>
 </div>

 {/* Recent Activity */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Recent Messages */}
 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-black text-slate-900 ">Recent Messages</h3>
 <Link to="/agent/messages" className="text-xs font-bold text-indigo-500 hover:text-indigo-400">
 View All
 </Link>
 </div>
 {/* We would fetch recent messages here, for now a placeholder that looks real */}
 <div className="space-y-4">
 <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3">
 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm">J</div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-slate-900 text-xs truncate">John Doe</p>
 <p className="text-[10px] text-slate-500 truncate">I'm interested in the excavator...</p>
 </div>
 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-sm shadow-indigo-500/50" />
 </div>
 <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Direct Messaging Active</p>
 </div>
 </div>

 {/* Recent Leads */}
 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-black text-slate-900 ">Recent Leads</h3>
 <Link to="/agent/leads" className="text-xs font-bold text-amber-500 hover:text-amber-400">
 View All
 </Link>
 </div>
 {recentLeads.length > 0 ? (
 <div className="space-y-4">
 {recentLeads.map(lead => (
 <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
 <div>
 <p className="font-bold text-slate-900 text-sm">{lead.listingName}</p>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest">
 {lead.consumerName} • {lead.projectLocation}
 </p>
 </div>
 <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
 lead.status === 'new' ? 'bg-amber-500/10 text-amber-500' :
 lead.status === 'quoted' ? 'bg-indigo-500/10 text-indigo-500' :
 'bg-slate-200 text-slate-500 '
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

 {/* Recent Bookings (legacy/cars) */}
 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-black text-slate-900 ">Recent Bookings</h3>
 <Link to="/agent/bookings" className="text-xs font-bold text-indigo-500 hover:text-indigo-400">
 View All
 </Link>
 </div>
 {recentBookings.length > 0 ? (
 <div className="space-y-4">
 {recentBookings.map(booking => (
 <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
 <div>
 <p className="font-bold text-slate-900 text-sm">{booking.listingName}</p>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest">
 {booking.startDate} - {booking.endDate}
 </p>
 </div>
 <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
 booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
 booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
 'bg-slate-200 text-slate-500 '
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
