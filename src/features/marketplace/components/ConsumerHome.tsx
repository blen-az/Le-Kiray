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
      try {
        if (currentUser) {
          const [bookingsData, listingsData] = await Promise.all([
            getBookingsByConsumer(currentUser.id),
            getFeaturedListings()
          ]);
          
          const active = bookingsData.filter(b => 
            b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'pending'
          );
          
          setActiveBookings(active);
          setFeaturedListings(listingsData.slice(0, 4));
        } else {
          const listingsData = await getFeaturedListings();
          setFeaturedListings(listingsData.slice(0, 4));
        }
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
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 blueprint-grid">
        <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get first booking for Active Booking display
  const primaryBooking = activeBookings[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 blueprint-grid-lg animate-fade-in font-sans">
      {/* CAD Blueprint line accent */}
      <div className="w-full h-[1px] bg-slate-200/60" />

      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Personalized Welcome Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#FF8A00] uppercase tracking-[0.2em]">OPERATIONAL COMMAND</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {currentUser ? `Good Morning, ${currentUser.name.split(' ')[0]} 👋` : 'Welcome to Le\'Kiray 👋'}
            </h1>
            <p className="text-slate-500 text-xs font-semibold">Ready for your next project or fleet deployment?</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center font-black text-slate-800 text-lg overflow-hidden">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}</span>
            )}
          </div>
        </div>

        {/* Large Primary CTA Surface */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[28px] p-6 shadow-dribbble flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-main/5 rounded-full blur-2xl -z-10" />
          <div className="space-y-2">
            <span className="px-2.5 py-1 bg-brand-main/10 text-brand-main rounded-lg text-[9px] font-black uppercase tracking-wider border border-brand-main/10">
              Procurement Hub
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Explore Certified Operational Fleet</h2>
            <p className="text-slate-500 text-xs max-w-md font-medium leading-relaxed">
              Instantly request quotes, verify logistics, and deploy heavy excavators, cranes, or compactors directly to your project coordinates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3.5 bg-brand-main hover:bg-brand-main/95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-brand-main/15 active:scale-98 flex items-center justify-center gap-2"
            >
              Explore Equipment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
            {primaryBooking && (
              <button 
                onClick={() => navigate('/bookings')}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-98 flex items-center justify-center"
              >
                Resume Booking
              </button>
            )}
          </div>
        </div>

        {/* Active Booking Card (Logistics tracker format) */}
        {primaryBooking ? (
          <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-dribbble space-y-6 relative overflow-hidden">
            {/* Corner CAD detail */}
            <div className="absolute top-0 right-0 w-16 h-16 industrial-stripes-subtle rotate-45 translate-x-8 -translate-y-8" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  Active Deployment
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{primaryBooking.listingName}</h3>
                <p className="text-slate-450 text-[10px] font-bold">Lease Contract: #{primaryBooking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-brand-main tracking-tight leading-none">
                  {Math.max(1, Math.round((new Date(primaryBooking.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))}
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Days Remaining</p>
              </div>
            </div>

            {/* Simulated Logistics Status Step Tracker */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Mobilization</span>
                <span>In Transit</span>
                <span>On Site</span>
              </div>
              {/* Progress bar */}
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-main to-brand-accent rounded-full transition-all duration-500" 
                  style={{ width: primaryBooking.status === 'confirmed' ? '40%' : '100%' }}
                />
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-ping" />
                  Status: <strong className="text-slate-800 capitalize">{primaryBooking.status.replace('_', ' ')}</strong>
                </span>
                <button 
                  onClick={() => navigate('/bookings')}
                  className="text-brand-main text-[10px] font-black uppercase tracking-wider hover:underline"
                >
                  Track Delivery & Docs →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Active Booking State */
          <div className="bg-white border border-slate-200/60 rounded-[28px] p-8 text-center shadow-premium relative overflow-hidden dots-grid">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">No active assets deployed</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">Your current heavy machinery bookings and logistics status updates will be displayed here.</p>
          </div>
        )}

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Command Controls</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Search Machinery', icon: '🔍', action: () => navigate('/marketplace') },
              { label: 'Saved Equipment', icon: '⭐', action: () => navigate('/marketplace') },
              { label: 'Message Support', icon: '💬', action: () => navigate('/messages') },
              { label: 'Nearby Fleet', icon: '📍', action: () => navigate('/marketplace') },
              { label: 'Request Quote', icon: '📋', action: () => navigate('/messages') },
            ].map((act, i) => (
              <button
                key={i}
                onClick={act.action}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-brand-main/20 hover:shadow-dribbble transition-all duration-300 group text-center space-y-2 cursor-pointer"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">{act.icon}</span>
                <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Operational Overview Stats Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Available Fleet', value: '450+', desc: 'Active Machinery' },
              { label: 'Upcoming Bookings', value: activeBookings.length, desc: 'Mobilizations Scheduled' },
              { label: 'Saved Assets', value: '12', desc: 'Monitored Units' },
              { label: 'Recent Messages', value: '3', desc: 'Coordinate Feeds' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-dribbble flex flex-col justify-between space-y-3">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className="space-y-0.5">
                  <span className="text-2xl font-black text-slate-900 block tracking-tight leading-none">{stat.value}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{stat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Equipment Section (Horizontal Cards) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recommended Heavy Fleet</h3>
            <button 
              onClick={() => navigate('/marketplace')} 
              className="text-brand-main text-[10px] font-black uppercase tracking-wider hover:underline"
            >
              Browse Directory
            </button>
          </div>
          <div className="space-y-4">
            {featuredListings.map(listing => {
              const dailyPrice = listing.dailyRate || 25000;
              return (
                <div 
                  key={listing.id}
                  onClick={() => navigate(`/vehicle/${listing.id}`)}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-dribbble flex flex-col sm:flex-row hover:border-brand-main/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="sm:w-1/3 relative h-40 sm:h-auto overflow-hidden bg-slate-100 min-h-[140px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                    <img 
                      src={listing.imageUrls[0] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600'} 
                      alt={listing.model} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                    />
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-2 py-0.5 bg-white/90 text-slate-800 text-[8px] font-black uppercase tracking-widest rounded border border-white/20">
                        {listing.category}
                      </span>
                    </div>
                  </div>
                  <div className="sm:w-2/3 p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                        <span>{listing.agentName || 'Verified Supplier'}</span>
                        <span className="w-1 h-1 bg-slate-350 rounded-full" />
                        <span>Year: {listing.year}</span>
                      </div>
                      <h4 className="text-md font-black text-slate-900 tracking-tight group-hover:text-brand-main transition-colors duration-200">
                        {listing.make} {listing.model}
                      </h4>
                      <p className="text-slate-450 text-[11px] font-medium line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-md font-black text-slate-900">{dailyPrice.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase">ETB/day</span>
                      </div>
                      <span className="text-[9px] font-black text-brand-main uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Deploy Asset →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Browsing (Mocks history) */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Continue Browsing</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: '1', title: 'CAT 320D L Excavator', date: 'Viewed yesterday', image: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?auto=format&fit=crop&w=300', price: '24,000 ETB' },
              { id: '2', title: 'Komatsu D65 Dozer', date: 'Viewed 2 days ago', image: 'https://images.unsplash.com/photo-1580983218765-f663becf48d4?auto=format&fit=crop&w=300', price: '32,000 ETB' },
              { id: '3', title: 'Liebherr LTM 1050 Crane', date: 'Viewed 3 days ago', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300', price: '45,000 ETB' },
            ].map(hist => (
              <div 
                key={hist.id}
                onClick={() => navigate('/marketplace')}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden p-3 shadow-sm min-w-[200px] w-[200px] flex-shrink-0 cursor-pointer hover:border-brand-main/20 hover:shadow-dribbble transition-all duration-300 group"
              >
                <div className="relative h-24 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img src={hist.image} alt={hist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 truncate leading-snug group-hover:text-brand-main transition-colors">{hist.title}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-slate-400 font-semibold">{hist.date}</span>
                  <span className="text-[10px] font-bold text-slate-700">{hist.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Equipment Map Preview */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nearby Active Fleet</h3>
          <div className="bg-white border border-slate-100 rounded-[28px] overflow-hidden p-5 shadow-dribbble space-y-4">
            <div className="relative h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-150">
              {/* Grid backdrop */}
              <div className="absolute inset-0 blueprint-grid opacity-35" />
              {/* Simulated Map markings */}
              <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-brand-main rounded-full border-2 border-white shadow shadow-brand-main/50 animate-bounce" />
              <div className="absolute top-1/2 left-2/3 w-3.5 h-3.5 bg-brand-main rounded-full border-2 border-white shadow shadow-brand-main/50 animate-pulse" />
              <div className="absolute top-2/3 left-1/2 w-3.5 h-3.5 bg-brand-accent rounded-full border-2 border-white shadow shadow-brand-accent/50" />
              <div className="absolute bottom-3 left-3 bg-white/90 border border-slate-100 px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1">
                <span>📍 Addis Ababa Hub Area</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <p className="text-slate-500 font-medium">3 certified construction assets deployed near your coordinates.</p>
              <button 
                onClick={() => navigate('/marketplace')}
                className="text-brand-main text-[10px] font-black uppercase tracking-wider hover:underline shrink-0"
              >
                Launch Map Index →
              </button>
            </div>
          </div>
        </div>

        {/* Trusted Suppliers */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trusted Enterprise Partners</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 's1', name: 'Nile Logistics Ltd.', rating: '4.9', active: '18 active listings', logo: 'N' },
              { id: 's2', name: 'Red Sea Cranes', rating: '4.8', active: '6 active listings', logo: 'R' },
              { id: 's3', name: 'Awash Fleet Rentals', rating: '4.9', active: '31 active listings', logo: 'A' },
            ].map(sup => (
              <div 
                key={sup.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-[220px] flex items-center gap-3 border-l-4 border-l-brand-main"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm">
                  {sup.logo}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate leading-snug">{sup.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-amber-500 font-black">⭐ {sup.rating}</span>
                    <span className="w-1 h-1 bg-slate-350 rounded-full" />
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase truncate">{sup.active}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activity Timeline</h3>
          <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-dribbble space-y-4">
            {[
              { title: 'Logistics mobilization checklist confirmed', time: '10:45 AM • Nile Logistics', desc: 'CAT 320D Excavator logistics dispatch verification signed.', icon: '✅' },
              { title: 'Invoice lease payment processed', time: 'Yesterday • Le\'Kiray Finance', desc: 'Tax invoice generated for Lease Contract #LK-8219.', icon: '💳' },
              { title: 'Inquiry response delivered to Niles Support', time: 'June 24, 2026 • Live Feed', desc: 'Timeline coordination feedback submitted.', icon: '✉️' },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 relative">
                {index < 2 && (
                  <div className="absolute left-[13px] top-6 bottom-[-20px] w-[1px] bg-slate-150" />
                )}
                <div className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs shrink-0 z-10 shadow-sm">
                  {item.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-900 tracking-tight leading-snug">{item.title}</h4>
                  <p className="text-[9px] text-[#FF8A00] font-black uppercase tracking-wider">{item.time}</p>
                  <p className="text-slate-500 text-[11px] font-medium mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConsumerHome;
