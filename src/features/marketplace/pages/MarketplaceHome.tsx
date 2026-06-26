import React, { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VehicleCategory, Listing } from '../../../types';
import { getListings } from '../../../services/listingService';
import VehicleCard from '../components/VehicleCard';
import VehicleFilters from '../components/VehicleFilters';
import BookingFlow from '../../booking/components/BookingFlow';

const MarketplaceHome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as VehicleCategory) || 'ALL';

  const [selectedVehicle, setSelectedVehicle] = useState<Listing | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | 'ALL'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local quick filtering states
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const { 
    data, 
    isLoading: loading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['listings', categoryFilter],
    queryFn: ({ pageParam = null }) => getListings(categoryFilter === 'ALL' ? undefined : categoryFilter, 12, pageParam),
    initialPageParam: null as any,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisible : undefined,
  });

  const listings = useMemo(() => {
    return data?.pages.flatMap(page => page.listings) || [];
  }, [data]);

  const getFallbackRates = (cat: VehicleCategory) => {
    switch (cat) {
      case VehicleCategory.EXCAVATOR: return { daily: 25000, hourly: 3200 };
      case VehicleCategory.DOZER: return { daily: 35000, hourly: 4500 };
      case VehicleCategory.LOADER: return { daily: 18000, hourly: 2300 };
      case VehicleCategory.CRANE: return { daily: 45000, hourly: 5800 };
      case VehicleCategory.DUMP_TRUCK: return { daily: 12000, hourly: 1500 };
      case VehicleCategory.COMPACTOR: return { daily: 10000, hourly: 1250 };
      default: return { daily: 15000, hourly: 1800 };
    }
  };

  const filteredVehicles = useMemo(() => {
    return listings.filter(v => {
      const matchesSearch = v.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === 'ALL' || v.location === locationFilter;
      const rate = v.dailyRate || getFallbackRates(v.category).daily;
      const matchesPrice = rate <= maxPrice;
      const matchesAvailability = !onlyAvailable || v.status === 'active';

      return matchesSearch && matchesLocation && matchesPrice && matchesAvailability;
    });
  }, [listings, searchQuery, locationFilter, maxPrice, onlyAvailable]);

  // Separate vehicles into featured, popular, and grid groups for Airbnb depth
  const featuredVehicles = useMemo(() => filteredVehicles.slice(0, 3), [filteredVehicles]);
  const popularVehicles = useMemo(() => filteredVehicles.slice(3, 7), [filteredVehicles]);
  const mainGridVehicles = useMemo(() => filteredVehicles.slice(7), [filteredVehicles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 blueprint-grid">
        <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedVehicle) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        <BookingFlow 
          vehicle={selectedVehicle} 
          onBack={() => setSelectedVehicle(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 animate-fade-in font-sans">
      
      {/* Sticky Premium Search Bar (Airbnb Centerpiece style) */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="Search machinery, make, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-[20px] focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white outline-none transition-all text-xs font-bold text-slate-800 placeholder:text-slate-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-main transition-colors">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            {/* Image / Voice search icons embedded in input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
              <button 
                title="Voice Search"
                className="w-8 h-8 rounded-lg hover:bg-slate-150 flex items-center justify-center transition-colors active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button 
                title="Image Search"
                className="w-8 h-8 rounded-lg hover:bg-slate-150 flex items-center justify-center transition-colors active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-8">
        
        {/* Dynamic Category Pill Tabs & Quick Filter Overlay */}
        <div className="space-y-4">
          <VehicleFilters 
            activeCategory={categoryFilter} 
            onCategoryChange={setCategoryFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
            maxPrice={maxPrice}
            onPriceChange={setMaxPrice}
            onlyAvailable={onlyAvailable}
            onAvailabilityChange={setOnlyAvailable}
          />
        </div>

        {/* Featured Equipment Carousel (Panoramic visual showcase) */}
        {featuredVehicles.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Featured Immersive Assets</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {featuredVehicles.map(veh => (
                <div 
                  key={veh.id}
                  onClick={() => setSelectedVehicle(veh)}
                  className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-dribbble flex-shrink-0 w-[290px] sm:w-[360px] snap-start hover:border-brand-main/20 hover:shadow-floating transition-all duration-500 cursor-pointer group"
                >
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    {/* Dark gradient on image to contrast texts */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                    <img 
                      src={veh.imageUrls[0] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600'} 
                      alt={veh.model} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-2.5 py-1 bg-white/95 text-slate-800 text-[8px] font-black uppercase tracking-widest rounded-md border border-white/20">
                        ⭐ {4.9} Verified
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-[#FF8A00] uppercase tracking-wider">{veh.category}</p>
                      <h4 className="text-md font-black text-slate-900 truncate tracking-tight">{veh.make} {veh.model}</h4>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-md font-black text-slate-900">{(veh.dailyRate || getFallbackRates(veh.category).daily).toLocaleString()}</span>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase">ETB/day</span>
                      </div>
                      <span className="text-[9px] font-black text-brand-main uppercase tracking-widest">
                        Deploy Asset →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Near You */}
        {popularVehicles.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Popular Near You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularVehicles.map(veh => (
                <div 
                  key={veh.id}
                  onClick={() => setSelectedVehicle(veh)}
                  className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-dribbble p-4 hover:border-brand-main/20 hover:shadow-floating transition-all duration-300 cursor-pointer flex gap-4 group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                    <img src={veh.imageUrls[0]} alt={veh.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[8px] font-black text-slate-450 uppercase tracking-widest">{veh.category}</p>
                      <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">{veh.make} {veh.model}</h4>
                      <p className="text-[9px] font-semibold text-slate-400 mt-1">📍 {veh.location}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">{(veh.dailyRate || getFallbackRates(veh.category).daily).toLocaleString()} ETB/day</span>
                      <span className="text-[8px] font-black text-brand-main uppercase tracking-wider">Deploy</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Marketplace Directory Grid */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">All Discovery Listings</h3>
            <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">
              {filteredVehicles.length} Active Machines
            </span>
          </div>

          {filteredVehicles.length > 0 ? (
            <div className="space-y-6">
              {/* Luxury real-estate layout grid: 1 card per row or 2 columns on tablet/desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(mainGridVehicles.length > 0 ? mainGridVehicles : filteredVehicles).map(veh => (
                  <VehicleCard 
                    key={veh.id} 
                    vehicle={veh} 
                    onSelect={() => setSelectedVehicle(veh)} 
                  />
                ))}
              </div>

              {/* Load More Pagination */}
              {hasNextPage && searchQuery === '' && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-3.5 bg-brand-main hover:bg-brand-main/95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-brand-main/15 cursor-pointer"
                  >
                    {isFetchingNextPage && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {isFetchingNextPage ? 'Loading more...' : 'Load More Machinery'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[28px] border border-slate-200/60 relative overflow-hidden dots-grid">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">No machinery matching index query</h4>
              <p className="text-slate-400 text-xs font-semibold mt-1">Try adjusting price limits or location coordinates.</p>
            </div>
          )}
        </section>

        {/* Verified Suppliers Panel */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Logistics Suppliers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Nile Logistics', score: '99%', rate: '12 ETB/km', bg: 'N' },
              { name: 'Awash Fleet', score: '98%', rate: '14 ETB/km', bg: 'A' },
              { name: 'Red Sea Operators', score: '100%', rate: 'Hourly Ops', bg: 'R' }
            ].map((sup, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700">{sup.bg}</div>
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{sup.score} Score</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug">{sup.name}</h4>
                  <p className="text-[9px] text-slate-450 font-semibold mt-0.5">{sup.rate}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default MarketplaceHome;
