import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBookingsByAgent } from '../../../services/bookingService';
import { getLeadsByAgent } from '../../../services/leadService';
import { getSubscriptionUsage } from '../../../services/subscriptionService';
import { getListingsByAgent } from '../../../services/listingService';
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
    chartData: [] as { name: string; bookings: number; leads: number; revenue: number }[],
  });

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
        const catName = listing.category.replace('_', ' ');
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      }

      // Count leads by status
      const statusCount: Record<string, number> = {};
      for (const lead of leads) {
        statusCount[lead.status] = (statusCount[lead.status] || 0) + 1;
      }

      // Calculate chart data for the last 7 days
      const chartData = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const dayBookings = bookings.filter(b => b.createdAt && b.createdAt.startsWith(dateStr));
        const dayLeads = leads.filter(l => l.createdAt && l.createdAt.startsWith(dateStr));
        const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        chartData.push({
          name: days[d.getDay()],
          bookings: dayBookings.length,
          leads: dayLeads.length,
          revenue: dayRevenue
        });
      }

      setStats({
        totalBookings: bookings.length,
        totalLeads: leads.length,
        totalRevenue,
        activeListings: usage.activeListings,
        maxListings: usage.subscription?.maxVehicles || 0,
        bookingsByCategory: Object.entries(categoryCount).map(([name, count]) => ({ name, count })),
        leadsByStatus: Object.entries(statusCount).map(([name, count]) => ({ name, count })),
        chartData,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      loadLoading();
    }
  };

  const loadLoading = () => {
    setLoading(false);
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
          Fleet Analytics <span className="text-[#FF8A00] font-medium text-lg px-2.5 py-0.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">Performance</span>
        </h1>
        <p className="text-slate-500 mt-1">Track conversions, lease revenue, and active fleet utilization metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-950 rounded-3xl p-6 shadow-dribbble relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-main/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Bookings</p>
          <p className="text-3xl font-black text-white tracking-tight">{stats.totalBookings}</p>
        </div>

        <div className="bg-gradient-to-tr from-brand-main to-blue-700 rounded-3xl p-6 shadow-dribbble relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Total Leads</p>
          <p className="text-3xl font-black text-white tracking-tight">{stats.totalLeads}</p>
        </div>

        <div className="bg-gradient-to-tr from-[#FF8A00] to-[#E06A00] rounded-3xl p-6 shadow-dribbble relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <p className="text-amber-100 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-3xl font-black text-white tracking-tight">{stats.totalRevenue.toLocaleString()}<span className="text-sm font-extrabold ml-1">ETB</span></p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-dribbble card-premium-glow flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Fleet Utilization</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeListings}<span className="text-sm text-slate-500 font-bold ml-1">/ {stats.maxListings}</span></p>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-main rounded-full"
                style={{ width: `${stats.maxListings > 0 ? (stats.activeListings / stats.maxListings) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-dribbble card-premium-glow space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Revenue</h3>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-main" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Revenue (ETB)</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#355CFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#355CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid #1E293B', padding: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  itemStyle={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#355CFF" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-dribbble card-premium-glow space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Activity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-main" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Leads</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid #1E293B', padding: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  itemStyle={{ color: '#fff', fontWeight: 800 }}
                />
                <Bar dataKey="bookings" fill="#355CFF" radius={[6, 6, 0, 0]} barSize={12} />
                <Bar dataKey="leads" fill="#FF8A00" radius={[6, 6, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
