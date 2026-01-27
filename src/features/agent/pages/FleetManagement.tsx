import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Listing, ListingStatus, VehicleCategory, isBookableCategory } from '../../../types';
import { getListingsByAgent, updateListingStatus } from '../../../services/listingService';
import { canPublishListing } from '../../../services/subscriptionService';

interface FleetManagementProps {
  agentId: string;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ agentId }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishInfo, setPublishInfo] = useState({ allowed: true, currentCount: 0, maxAllowed: 0 });
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  useEffect(() => {
    loadListings();
  }, [agentId]);

  const loadListings = async () => {
    try {
      const [data, canPublish] = await Promise.all([
        getListingsByAgent(agentId),
        canPublishListing(agentId),
      ]);
      setListings(data);
      setPublishInfo(canPublish);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ListingStatus) => {
    try {
      await updateListingStatus(id, status);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const getCategoryColor = (category: VehicleCategory) => {
    if (category === VehicleCategory.EARTH_MOVING) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
  };

  const getStatusColor = (status: ListingStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500';
      case 'paused': return 'bg-amber-500/10 text-amber-500';
      case 'draft': return 'bg-slate-700 text-slate-400';
      case 'pending_review': return 'bg-indigo-500/10 text-indigo-500';
      case 'archived': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-700 text-slate-400';
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
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Fleet Management</h1>
          <p className="text-slate-500 mt-1">
            {publishInfo.currentCount} of {publishInfo.maxAllowed} slots used
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!publishInfo.allowed && (
            <span className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold">
              Limit Reached
            </span>
          )}
          <Link
            to="/agent/listings/new"
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              publishInfo.allowed 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Fleet Capacity</span>
          <span className="text-sm font-bold text-white">{publishInfo.currentCount}/{publishInfo.maxAllowed}</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
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
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
            <div key={listing.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group">
              <div className="flex">
                {/* Image */}
                <div className="w-40 h-40 shrink-0 bg-slate-800 relative overflow-hidden">
                  {listing.imageUrls?.[0] ? (
                    <img 
                      src={listing.imageUrls[0]} 
                      alt={`${listing.make} ${listing.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
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
                      <h3 className="font-bold text-white">{listing.make} {listing.model}</h3>
                      <p className="text-xs text-slate-500">{listing.year} • {listing.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${getStatusColor(listing.status)}`}>
                      {listing.status.replace('_', ' ')}
                    </span>
                  </div>

                  {isBookableCategory(listing.category) && listing.dailyRate && (
                    <p className="text-lg font-black text-indigo-400 mt-2">
                      {listing.dailyRate.toLocaleString()} ETB<span className="text-xs text-slate-500">/day</span>
                    </p>
                  )}

                  <div className="mt-auto flex gap-2 pt-4">
                    <Link 
                      to={`/agent/listings/${listing.id}/edit`}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold text-center transition-colors"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-white mb-2">No vehicles in your fleet</h3>
          <p className="text-slate-500 mb-8">Add your first vehicle to start receiving bookings and leads.</p>
          <Link
            to="/agent/listings/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Vehicle
          </Link>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
