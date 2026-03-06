import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBookingsByAgent } from '../../../services/bookingService';
import { getLeadsByAgent } from '../../../services/leadService';
import { getSubscriptionUsage } from '../../../services/subscriptionService';
import { getListingsByAgent } from '../../../services/listingService';
import { VehicleCategory } from '../../../types';
import { useAuth } from '../../../features/auth/context/AuthContext';

const AnalyticsPage: React.FC = () => {
  const { currentUser: user } = useAuth();
  const agentId = user?.id || '';
  
  if (!user) return null;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalLeads: 0,
    totalRevenue: 0,
    activeListings: 0,
    maxListings: 0,
    bookingsByCategory: [] as { name: string; count: number }[],
    leadsByStatus: [] as { name: string; count: number }[],
  });

  // Mock weekly data for charts (would come from real analytics in production)
  const weeklyData = [
    { name: 'Mon', bookings: 2, leads: 1, revenue: 4500 },
    { name: 'Tue', bookings: 3, leads: 2, revenue: 9000 },
    { name: 'Wed', bookings: 1, leads: 3, revenue: 3500 },
    { name: 'Thu', bookings: 4, leads: 1, revenue: 12000 },
    { name: 'Fri', bookings: 2, leads: 4, revenue: 8000 },
    { name: 'Sat', bookings: 5, leads: 2, revenue: 15000 },
    { name: 'Sun', bookings: 3, leads: 1, revenue: 9500 },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [agentId]);

  const loadAnalytics = async () => {
    try {
      const [bookings, leads, usage, listings] = await Promise.all([
        getBookingsByAgent(agentId),
        getLeadsByAgent(agentId),
        getSubscriptionUsage(agentId),
        getListingsByAgent(agentId),
      ]);

      const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // Count bookings by category
      const categoryCount: Record<string, number> = {};
      for (const listing of listings) {
        if (listing.category !== VehicleCategory.EARTH_MOVING) {
          const catName = listing.category.replace('_', ' ');
          categoryCount[catName] = (categoryCount[catName] || 0) + 1;
        }
      }

      // Count leads by status
      const statusCount: Record<string, number> = {};
      for (const lead of leads) {
        statusCount[lead.status] = (statusCount[lead.status] || 0) + 1;
      }

      setStats({
        totalBookings: bookings.length,
        totalLeads: leads.length,
        totalRevenue,
        activeListings: usage.activeListings,
        maxListings: usage.subscription?.maxVehicles || 0,
        bookingsByCategory: Object.entries(categoryCount).map(([name, count]) => ({ name, count })),
        leadsByStatus: Object.entries(statusCount).map(([name, count]) => ({ name, count })),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your fleet performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20">
          <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Total Bookings</p>
          <p className="text-4xl font-black text-white">{stats.totalBookings}</p>
        </div>
        <div className="bg-amber-600 rounded-2xl p-6 shadow-lg shadow-amber-500/20">
          <p className="text-amber-200 text-xs font-black uppercase tracking-widest mb-2">Total Leads</p>
          <p className="text-4xl font-black text-white">{stats.totalLeads}</p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20">
          <p className="text-emerald-200 text-xs font-black uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-4xl font-black text-white">{stats.totalRevenue.toLocaleString()}<span className="text-lg"> ETB</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Fleet Usage</p>
          <p className="text-4xl font-black text-white">{stats.activeListings}<span className="text-lg text-slate-500">/{stats.maxListings}</span></p>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${stats.maxListings > 0 ? (stats.activeListings / stats.maxListings) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-white">Weekly Revenue</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-slate-400">Revenue (ETB)</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                  labelStyle={{ color: '#fff', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-white">Weekly Activity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-slate-400">Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-400">Leads</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                  labelStyle={{ color: '#fff', fontWeight: 700 }}
                />
                <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
