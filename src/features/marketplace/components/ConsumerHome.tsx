import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { Booking, Listing } from '../../../types';
import { getBookingsByConsumer } from '../../../services/bookingService';
import { getFeaturedListings } from '../../../services/listingService';

const ConsumerHome: React.FC = () => {
 const navigate = useNavigate();
 const { currentUser } = useAuth();
 const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
 const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchData = async () => {
 if (!currentUser) return;
 try {
 const [bookingsData, listingsData] = await Promise.all([
 getBookingsByConsumer(currentUser.id),
 getFeaturedListings()
 ]);
 // Filter for active/upcoming bookings
 const active = bookingsData.filter(b => 
 b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'pending'
 ).slice(0, 3);
 
 setActiveBookings(active);
 setFeaturedListings(listingsData.slice(0, 4));
 } catch (error) {
 console.error('Error fetching consumer home data:', error);
 } finally {
 setLoading(false);
 }
 };

 fetchData();
 }, [currentUser]);

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <div className="w-10 h-10 border-4 border-brand-main border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 return (
 <div className="max-w-[1440px] mx-auto px-6 py-8 md:py-12 space-y-12 animate-fade-in">
 {/* Welcome Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
 Hello, {currentUser?.name.split(' ')[0]}! 👋
 </h1>
 <p className="text-slate-500 font-medium">Ready for your next project or trip?</p>
 </div>
 <div className="flex gap-3">
 <button 
 onClick={() => navigate('/marketplace')}
 className="px-6 py-3 bg-brand-main hover:bg-brand-main/90 text-white font-bold rounded-2xl shadow-xl shadow-brand-main/20 transition-all hover:-translate-y-1 active:scale-95 text-sm"
 >
 Explore Marketplace
 </button>
 </div>
 </div>

 {/* Active Bookings Section */}
 {activeBookings.length > 0 && (
 <section>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
 Active Bookings
 </h2>
 <button 
 onClick={() => navigate('/bookings')}
 className="text-brand-main text-sm font-bold hover:underline"
 >
 View All
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {activeBookings.map(booking => (
 <div 
 key={booking.id}
 onClick={() => navigate('/bookings')}
 className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer"
 >
 <div className="flex justify-between items-start mb-4">
 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
 booking.status === 'confirmed' ? 'bg-indigo-500/10 text-indigo-500' : 
 booking.status === 'in_progress' ? 'bg-emerald-500/10 text-emerald-500' : 
 'bg-amber-500/10 text-amber-500'
 }`}>
 {booking.status.replace('_', ' ')}
 </span>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {booking.id.slice(0, 8)}</p>
 </div>
 <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-main transition-colors">
 {booking.listingName}
 </h3>
 <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
 <span>{booking.startDate} → {booking.endDate}</span>
 </div>
 <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Paid</span>
 <span className="text-lg font-black text-brand-main">{booking.totalPrice.toLocaleString()} ETB</span>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* Quick Categories */}
 <section>
 <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Categories</h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { name: 'Cars', icon: '🚗', color: 'indigo', path: '/marketplace?category=COMPACT' },
 { name: 'SUVs', icon: '🏔️', color: 'blue', path: '/marketplace?category=FAMILY' },
 { name: 'Vans', icon: '🚐', color: 'emerald', path: '/marketplace?category=VAN' },
 { name: 'Heavy', icon: '🏗️', color: 'amber', path: '/marketplace?category=EARTH_MOVING' },
 ].map(cat => (
 <button
 key={cat.name}
 onClick={() => navigate(cat.path)}
 className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-[32px] hover:-translate-y-1 hover:shadow-xl transition-all group"
 >
 <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
 <span className="font-bold text-slate-900 ">{cat.name}</span>
 </button>
 ))}
 </div>
 </section>

 {/* Featured For You */}
 <section>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-slate-900 ">Featured For You</h2>
 <button 
 onClick={() => navigate('/marketplace')}
 className="text-brand-main text-sm font-bold hover:underline"
 >
 Show All
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {featuredListings.map(listing => (
 <div 
 key={listing.id}
 onClick={() => navigate(`/vehicle/${listing.id}`)}
 className="group cursor-pointer"
 >
 <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-4 bg-slate-100 ">
 <img 
 src={listing.imageUrls[0]} 
 alt={listing.make} 
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 {listing.dailyRate && (
 <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg">
 <span className="text-sm font-black text-brand-main">{listing.dailyRate.toLocaleString()} ETB</span>
 <span className="text-[8px] font-black text-slate-500 uppercase ml-1">/ day</span>
 </div>
 )}
 </div>
 <h3 className="font-bold text-slate-900 mb-1 px-2">{listing.year} {listing.make} {listing.model}</h3>
 <p className="text-xs text-slate-500 px-2 flex items-center gap-1">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 {listing.location}
 </p>
 </div>
 ))}
 </div>
 </section>
 </div>
 );
};

export default ConsumerHome;
