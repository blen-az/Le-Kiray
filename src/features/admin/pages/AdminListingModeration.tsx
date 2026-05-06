import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAdminListings, approveListing, suspendListing } from '../../../services/listingService';
import { Listing } from '../../../types';

const STATUS_TABS = ['all', 'pending_review', 'active', 'archived', 'draft'];

const statusStyle: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  draft: 'bg-slate-700 text-slate-300 border-slate-600',
  archived: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const AdminListingModeration: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: getAllAdminListings,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveListing(id, 'admin'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendListing(id, 'Suspended by admin'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
  });

  const filtered = listings.filter((l: Listing) => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.make.toLowerCase().includes(term) ||
      l.model.toLowerCase().includes(term) ||
      l.agentName?.toLowerCase().includes(term) ||
      l.category.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: listings.length,
    pending_review: listings.filter((l: Listing) => l.status === 'pending_review').length,
    active: listings.filter((l: Listing) => l.status === 'active').length,
    archived: listings.filter((l: Listing) => l.status === 'archived').length,
    draft: listings.filter((l: Listing) => l.status === 'draft').length,
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Listing Moderation</h1>
          <p className="text-slate-500 mt-1">Approve, review and suspend machinery listings</p>
        </div>
        {counts.pending_review > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-bold">{counts.pending_review} awaiting review</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by machine, agent or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap text-sm flex items-center gap-2 ${
              filter === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All' : tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${filter === tab ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>
              {counts[tab as keyof typeof counts] ?? 0}
            </span>
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
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No listings match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((listing: Listing) => (
                  <tr key={listing.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {listing.imageUrls?.[0] ? (
                          <img
                            src={listing.imageUrls[0]}
                            alt={listing.make}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-500 text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-bold text-sm">{listing.year} {listing.make} {listing.model}</p>
                          <p className="text-slate-500 text-xs">{listing.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">{listing.category.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm font-medium">{listing.agentName || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusStyle[listing.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {listing.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 text-xs">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(listing.status === 'pending_review' || listing.status === 'draft') && (
                          <button
                            onClick={() => approveMutation.mutate(listing.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {listing.status === 'active' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Suspend this listing? It will be removed from the marketplace.')) {
                                suspendMutation.mutate(listing.id);
                              }
                            }}
                            disabled={suspendMutation.isPending}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[10px] font-black uppercase border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        {listing.status === 'archived' && (
                          <button
                            onClick={() => approveMutation.mutate(listing.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}
                      </div>
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

export default AdminListingModeration;
