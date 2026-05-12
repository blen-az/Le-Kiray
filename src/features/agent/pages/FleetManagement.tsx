import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Listing, ListingStatus, VehicleCategory, isBookableCategory } from '../../../types';
import { getListingsByAgent, updateListingStatus } from '../../../services/listingService';
import { canPublishListing } from '../../../services/subscriptionService';
import { useAuth } from '../../../features/auth/context/AuthContext';

const FleetManagement: React.FC = () => {
 const { currentUser: user } = useAuth();
 const agentId = user?.id || '';
 if (!user) return null;
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

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
 <div className="p-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
 <div className="mb-10">
 <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Management</h1>
 <p className="text-slate-500 mt-1">Manage your vehicles and equipment</p>
 </div>
 <div className="flex items-center gap-4">
 {!publishInfo.allowed && (
 <span className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold">
 Limit Reached
 </span>
 )}
 <button
          onClick={() => publishInfo.allowed ? navigate('/agent/listings/new') : null}
          disabled={!publishInfo.allowed}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            publishInfo.allowed 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
          }`}
          title={!publishInfo.allowed ? "Subscription limit reached" : ""}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Vehicle
        </button>
 </div>
 </div>

 {/* Capacity Bar */}
 <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
 <div className="flex justify-between items-center mb-3">
 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Fleet Capacity</span>
 <span className="text-sm font-bold text-slate-900 ">{publishInfo.currentCount}/{publishInfo.maxAllowed}</span>
 </div>
 <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all ${
 publishInfo.currentCount >= publishInfo.maxAllowed ? 'bg-red-500' : 'bg-indigo-600'
 }`}
 style={{ width: `${publishInfo.maxAllowed > 0 ? (publishInfo.currentCount / publishInfo.maxAllowed) * 100 : 0}%` }}
 />
 </div>
 </div>

 {/* Filters */}
 <div className="flex gap-2 mb-8">
 {['all', 'active', 'paused', 'draft'].map((f) => (
 <button
 key={f}
 onClick={() => setFilter(f as any)}
 className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
 filter === f 
 ? 'bg-indigo-600 text-white' 
 : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 '
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
 <div key={listing.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all group shadow-sm">
 <div className="flex">
 {/* Image */}
 <div className="w-40 h-40 shrink-0 bg-slate-100 relative overflow-hidden">
 {listing.imageUrls?.[0] ? (
 <img 
 src={listing.imageUrls[0]} 
 alt={`${listing.make} ${listing.model}`}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-400 ">
 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}
 <div className="absolute top-2 left-2">
 <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${getCategoryColor(listing.category)}`}>
 {listing.category.replace('_', ' ')}
 </span>
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 p-5 flex flex-col">
 <div className="flex justify-between items-start mb-2">
 <div>
 <h3 className="font-bold text-slate-900 ">{listing.make} {listing.model}</h3>
 <p className="text-xs text-slate-500 ">{listing.year} • {listing.location}</p>
 </div>
 <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${getStatusColor(listing.status)}`}>
 {listing.status.replace('_', ' ')}
 </span>
 </div>

 {isBookableCategory(listing.category) && listing.dailyRate && (
 <p className="text-lg font-black text-indigo-600 mt-2">
 {listing.dailyRate.toLocaleString()} ETB<span className="text-xs text-slate-500">/day</span>
 </p>
 )}

 <div className="mt-auto flex gap-2 pt-4">
 <Link 
 to={`/agent/listings/${listing.id}/edit`}
 className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold text-center transition-colors"
 >
 Edit
 </Link>
 {listing.status === 'active' ? (
 <button 
 onClick={() => handleStatusChange(listing.id, 'paused')}
 className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-bold transition-colors"
 >
 Pause
 </button>
 ) : listing.status === 'paused' ? (
 <button 
 onClick={() => handleStatusChange(listing.id, 'active')}
 className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold transition-colors"
 >
 Activate
 </button>
 ) : null}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
 <svg className="w-10 h-10 text-slate-400 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 </div>
 <h3 className="text-xl font-black text-slate-900 mb-2">No vehicles in your fleet</h3>
 <p className="text-slate-500 mb-8">Add your first vehicle to start receiving bookings and leads.</p>
 <button
          onClick={() => publishInfo.allowed ? navigate('/agent/listings/new') : null}
          disabled={!publishInfo.allowed}
          className={`inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-colors ${
            publishInfo.allowed
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Your First Vehicle
        </button>
 </div>
 )}
 </div>
 );
};

export default FleetManagement;
