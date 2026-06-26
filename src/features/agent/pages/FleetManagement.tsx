import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Listing, ListingStatus, VehicleCategory, isBookableCategory } from '../../../types';
import { getListingsByAgent, updateListingStatus } from '../../../services/listingService';
import { canPublishListing } from '../../../services/subscriptionService';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { seedMockListings } from '../../../utils/seedData';

const FleetManagement: React.FC = () => {
 const { currentUser: user } = useAuth();
 const agentId = user?.id || '';
 if (!user) return null;
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
 const [isSeeding, setIsSeeding] = useState(false);

 const { data, isLoading: loading } = useQuery({
 queryKey: ['fleet-management', agentId],
 queryFn: async () => {
 const [listingsData, canPublish] = await Promise.all([
 getListingsByAgent(agentId),
 canPublishListing(agentId),
 ]);
 return { listings: listingsData, publishInfo: canPublish };
 },
 enabled: !!agentId,
 });

 const listings = data?.listings || [];
 const publishInfo = data?.publishInfo || { allowed: true, currentCount: 0, maxAllowed: 0 };

 const handleStatusChange = async (id: string, status: ListingStatus) => {
 try {
 await updateListingStatus(id, status);
 queryClient.setQueryData(['fleet-management', agentId], (oldData: any) => {
 if (!oldData) return oldData;
 return {
 ...oldData,
 listings: oldData.listings.map((l: Listing) => 
 l.id === id ? { ...l, status } : l
 )
 };
 });
 } catch (error) {
 console.error('Error updating status:', error);
 }
 };

 const filteredListings = listings.filter(l => {
 if (filter === 'all') return true;
 return l.status === filter;
 });

 const getCategoryColor = (category: VehicleCategory) => {
 return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
 };

 const getStatusColor = (status: ListingStatus) => {
 switch (status) {
 case 'active': return 'bg-emerald-500/10 text-emerald-500';
 case 'paused': return 'bg-amber-500/10 text-amber-500';
 case 'draft': return 'bg-slate-200 text-slate-500 ';
 case 'pending_review': return 'bg-indigo-500/10 text-indigo-500';
 case 'archived': return 'bg-red-500/10 text-red-500';
 default: return 'bg-slate-200 text-slate-500 ';
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
    <div className="p-8 min-h-screen bg-[#F7F9FC] blueprint-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Fleet Management <span className="text-[#FF8A00] font-medium text-lg px-2.5 py-0.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">Command</span>
          </h1>
          <p className="text-slate-500 mt-1">Add, edit, pause, and verify equipment listings inside your fleet</p>
        </div>
        <div className="flex items-center gap-3">
          {!publishInfo.allowed && (
            <span className="px-3.5 py-1.5 bg-red-50 text-red-650 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-200">
              Capacity Limit Reached
            </span>
          )}
          <button
            onClick={() => publishInfo.allowed ? navigate('/agent/listings/new') : null}
            disabled={!publishInfo.allowed}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
              publishInfo.allowed 
                ? 'bg-brand-main hover:bg-brand-main/90 text-white shadow-brand-main/20 hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
            title={!publishInfo.allowed ? "Subscription limit reached" : ""}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Asset
          </button>
          <button
            onClick={async () => {
              setIsSeeding(true);
              const success = await seedMockListings(user.id, user.companyName || user.name);
              if (success) {
                queryClient.invalidateQueries({ queryKey: ['fleet-management', agentId] });
              }
              setIsSeeding(false);
            }}
            disabled={isSeeding}
            className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all border ${
              isSeeding 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350 shadow-sm'
            }`}
            title="Seed Fake Data"
          >
            {isSeeding ? 'Seeding...' : 'Seed Data'}
          </button>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="bg-white border border-slate-100 rounded-[22px] p-6 mb-8 shadow-dribbble card-premium-glow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Machinery Slots</span>
          <span className="text-sm font-black text-slate-900">{publishInfo.currentCount} <span className="text-slate-400">/ {publishInfo.maxAllowed}</span></span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-550 ${
              publishInfo.currentCount >= publishInfo.maxAllowed ? 'bg-red-500' : 'bg-brand-main'
            }`}
            style={{ width: `${publishInfo.maxAllowed > 0 ? (publishInfo.currentCount / publishInfo.maxAllowed) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Filters (Linear Inspired Segmented Control) */}
      <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl flex gap-1 mb-8 overflow-x-auto shadow-premium max-w-max">
        {['all', 'active', 'paused', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === f 
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.id} className="bg-white border border-slate-100 rounded-[24px] overflow-hidden transition-all shadow-dribbble hover:shadow-dribbble-hover card-premium-glow group">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="w-full sm:w-44 h-40 shrink-0 bg-slate-50 relative overflow-hidden">
                  {listing.imageUrls?.[0] ? (
                    <img 
                      src={listing.imageUrls[0]} 
                      alt={`${listing.make} ${listing.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                      <svg className="w-10 h-10 stroke-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border border-white/20 bg-black/60 text-white backdrop-blur-md shadow-md">
                      {listing.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-lg tracking-tight truncate group-hover:text-brand-main transition-colors">{listing.make} {listing.model}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">{listing.year} • {listing.location}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 border ${getStatusColor(listing.status)}`}>
                      {listing.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2 pt-3 border-t border-slate-50">
                    <div>
                      {isBookableCategory(listing.category) && listing.dailyRate ? (
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                          {listing.dailyRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ETB/day</span>
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 italic">Quote-based rates</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/agent/listings/${listing.id}/edit`}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        Edit
                      </Link>
                      {listing.status === 'active' ? (
                        <button 
                          onClick={() => handleStatusChange(listing.id, 'paused')}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          Pause
                        </button>
                      ) : listing.status === 'paused' ? (
                        <button 
                          onClick={() => handleStatusChange(listing.id, 'active')}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          Activate
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-[28px] p-16 text-center shadow-premium dots-grid">
          <div className="w-20 h-20 bg-brand-main/5 border border-brand-main/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No vehicles in your fleet</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm mb-8">Add your first vehicle to start receiving bookings and leads on Le'Kiray.</p>
          <button
            onClick={() => publishInfo.allowed ? navigate('/agent/listings/new') : null}
            disabled={!publishInfo.allowed}
            className={`inline-flex items-center gap-2 px-6 py-3.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md ${
              publishInfo.allowed
                ? 'bg-brand-main hover:bg-brand-main/90 text-white shadow-brand-main/20 hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Vehicle
          </button>
        </div>
      )}
    </div>
 );
};

export default FleetManagement;
