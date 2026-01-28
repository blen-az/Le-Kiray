import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Booking, QuoteRequest } from '../../../types';
import { getBookingsByAgent } from '../../../services/bookingService';
import { getLeadsByAgent, countNewLeads } from '../../../services/leadService';
import { getSubscriptionUsage } from '../../../services/subscriptionService';
import { countActiveListings } from '../../../services/listingService';

interface AgentDashboardProps {
  user: User;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    activeListings: 0,
    maxListings: 0,
    pendingBookings: 0,
    newLeads: 0,
    daysRemaining: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentLeads, setRecentLeads] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [usage, bookings, leads, newLeadCount] = await Promise.all([
          getSubscriptionUsage(user.id),
          getBookingsByAgent(user.id),
          getLeadsByAgent(user.id),
          countNewLeads(user.id),
        ]);

        const pendingBookings = bookings.filter(b => b.status === 'pending').length;

        setStats({
          activeListings: usage.activeListings,
          maxListings: usage.subscription?.maxVehicles || 0,
          pendingBookings,
          newLeads: newLeadCount,
          daysRemaining: usage.daysRemaining,
        });

        setRecentBookings(bookings.slice(0, 3));
        setRecentLeads(leads.slice(0, 3));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user.id]);

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
        <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, {user.name}</h1>
        <p className="text-slate-500 mt-1">{user.companyName || 'Fleet Command'} • Agent Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fleet Usage</p>
          <p className="text-3xl font-black text-white">{stats.activeListings}<span className="text-lg text-slate-500">/{stats.maxListings}</span></p>
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${stats.maxListings > 0 ? (stats.activeListings / stats.maxListings) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Pending Bookings</p>
          <p className="text-3xl font-black text-white">{stats.pendingBookings}</p>
          <Link to="/agent/bookings" className="text-xs font-bold text-indigo-200 hover:text-white mt-4 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-amber-600 rounded-2xl p-6 shadow-lg shadow-amber-500/20">
          <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-2">New Leads</p>
          <p className="text-3xl font-black text-white">{stats.newLeads}</p>
          <Link to="/agent/leads" className="text-xs font-bold text-amber-200 hover:text-white mt-4 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subscription</p>
          <p className="text-3xl font-black text-white">{stats.daysRemaining}<span className="text-lg text-slate-500"> days</span></p>
          <Link to="/agent/subscription" className="text-xs font-bold text-slate-400 hover:text-white mt-4 inline-block">
            Manage Plan →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <Link 
          to="/agent/listings/new"
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-8 flex items-center gap-6 transition-all group"
        >
          <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
            <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Add New Vehicle</h3>
            <p className="text-sm text-slate-500">List a car, van, or heavy equipment</p>
          </div>
        </Link>

        <Link 
          to="/agent/fleet"
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-8 flex items-center gap-6 transition-all group"
        >
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-slate-700 transition-colors">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Manage Fleet</h3>
            <p className="text-sm text-slate-500">Edit, pause, or update your listings</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white">Recent Bookings</h3>
            <Link to="/agent/bookings" className="text-xs font-bold text-indigo-500 hover:text-indigo-400">
              View All
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                  <div>
                    <p className="font-bold text-white text-sm">{booking.listingName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {booking.startDate} - {booking.endDate}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                    booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-slate-800 text-slate-400'
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

        {/* Recent Leads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white">Recent Leads</h3>
            <Link to="/agent/leads" className="text-xs font-bold text-amber-500 hover:text-amber-400">
              View All
            </Link>
          </div>
          {recentLeads.length > 0 ? (
            <div className="space-y-4">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                  <div>
                    <p className="font-bold text-white text-sm">{lead.listingName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {lead.consumerName} • {lead.projectLocation}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    lead.status === 'new' ? 'bg-amber-500/10 text-amber-500' :
                    lead.status === 'quoted' ? 'bg-indigo-500/10 text-indigo-500' :
                    'bg-slate-800 text-slate-400'
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
      </div>
    </div>
  );
};

export default AgentDashboard;
