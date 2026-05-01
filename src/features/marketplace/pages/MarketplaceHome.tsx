import React, { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { VehicleCategory, Listing } from '../../../types';
import { getListings } from '../../../services/listingService';
import VehicleCard from '../components/VehicleCard';
import VehicleFilters from '../components/VehicleFilters';
import BookingFlow from '../../booking/components/BookingFlow';

const MarketplaceHome: React.FC = () => {
 const navigate = useNavigate();
 const [selectedVehicle, setSelectedVehicle] = useState<Listing | null>(null);
 const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | 'ALL'>('ALL');
 const [searchQuery, setSearchQuery] = useState('');
 const { 
 data, 
 isLoading: loading, 
 fetchNextPage, 
 hasNextPage, 
 isFetchingNextPage 
 } = useInfiniteQuery({
 queryKey: ['listings', categoryFilter],
 queryFn: ({ pageParam = null }) => getListings(categoryFilter === 'ALL' ? undefined : categoryFilter, 9, pageParam),
 initialPageParam: null as any,
 getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisible : undefined,
 });

 const listings = useMemo(() => {
 return data?.pages.flatMap(page => page.listings) || [];
 }, [data]);

 const filteredVehicles = useMemo(() => {
 return listings.filter(v => {
 const matchesSearch = v.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
 v.model.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesSearch;
 });
 }, [listings, searchQuery]);

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 if (selectedVehicle) {
 return (
 <BookingFlow 
 vehicle={selectedVehicle} 
 onBack={() => setSelectedVehicle(null)} 
 />
 );
 }

 return (
 <div className="max-w-[1440px] mx-auto px-4 py-6 md:py-12">
 <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
 <aside className="w-full lg:w-72 shrink-0">
 <div className="lg:sticky lg:top-28">
 <VehicleFilters 
 activeCategory={categoryFilter} 
 onCategoryChange={setCategoryFilter}
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 />
 </div>
 </aside>
 
 <main className="flex-1">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-xl font-black text-slate-900 ">Equipment Marketplace</h2>
 <p className="text-slate-600 text-sm">{filteredVehicles.length} results found</p>
 </div>
 </div>
 {filteredVehicles.length > 0 ? (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
 {filteredVehicles.map(v => (
 <VehicleCard 
 key={v.id} 
 vehicle={v} 
 onSelect={() => setSelectedVehicle(v)} 
 />
 ))}
 </div>
 
 {hasNextPage && searchQuery === '' && (
 <div className="flex justify-center mb-12">
 <button 
 onClick={() => fetchNextPage()}
 disabled={isFetchingNextPage}
 className="px-8 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {isFetchingNextPage && <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />}
 {isFetchingNextPage ? 'Loading more...' : 'Load More'}
 </button>
 </div>
 )}
 </>
 ) : (
 <div className="text-center py-32 bg-slate-100 rounded-3xl border border-slate-200 ">
 <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
 </div>
 <h3 className="text-lg font-bold text-slate-900 ">No equipment matching your search</h3>
 <p className="text-slate-600 text-sm mt-2">Try adjusting your filters or search keywords.</p>
 </div>
 )}
 </main>
 </div>
 </div>
 );
};

export default MarketplaceHome;
