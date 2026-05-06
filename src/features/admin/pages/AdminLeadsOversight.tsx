import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllLeadsAdmin } from '../../../services/leadService';
import { QuoteRequest } from '../../../types';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  quoted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const AdminLeadsOversight: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: getAllLeadsAdmin,
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const filtered = leads.filter((l: QuoteRequest) => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.listingName?.toLowerCase().includes(term) ||
      l.agentId?.toLowerCase().includes(term) ||
      l.consumerId?.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: leads.length,
    new: leads.filter((l: QuoteRequest) => l.status === 'new').length,
    contacted: leads.filter((l: QuoteRequest) => l.status === 'contacted').length,
    quoted: leads.filter((l: QuoteRequest) => l.status === 'quoted').length,
    won: leads.filter((l: QuoteRequest) => l.status === 'won').length,
    lost: leads.filter((l: QuoteRequest) => l.status === 'lost').length,
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Booking Requests</h1>
          <p className="text-slate-500 mt-1">Platform-wide booking activity overview</p>
        </div>
        {counts.new > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-indigo-400 text-sm font-bold">{counts.new} new requests</span>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'New', value: counts.new, color: 'text-indigo-400' },
          { label: 'Contacted', value: counts.contacted, color: 'text-amber-400' },
          { label: 'Quoted', value: counts.quoted, color: 'text-blue-400' },
          { label: 'Won', value: counts.won, color: 'text-emerald-400' },
          { label: 'Lost', value: counts.lost, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Conversion Rate */}
      {leads.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">Win Rate</p>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${leads.length ? Math.round((counts.won / leads.length) * 100) : 0}%` }}
              />
            </div>
          </div>
          <p className="text-2xl font-black text-white whitespace-nowrap">
            {leads.length ? Math.round((counts.won / leads.length) * 100) : 0}%
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by listing, agent ID, or consumer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {Object.entries(counts).map(([tab, count]) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${filter === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${filter === tab ? 'bg-white/20' : 'bg-slate-700'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Machine</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Project Info</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No quote requests found.</td></tr>
              ) : (
                filtered.map((lead: QuoteRequest) => (
                  <tr key={lead.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm">{lead.listingName || '—'}</p>
                      <p className="text-slate-500 text-xs truncate max-w-[150px]">Agent: {lead.agentId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm line-clamp-2 max-w-[200px]">{lead.scopeOfWork || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {lead.requestedStartDate ? (
                        <>
                          <div className="font-bold text-slate-200">
                            {lead.requestedStartDate} {lead.requestedEndDate ? `— ${lead.requestedEndDate}` : ''}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest opacity-60">{lead.duration}</div>
                        </>
                      ) : (
                        lead.duration || '—'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[lead.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadsOversight;
