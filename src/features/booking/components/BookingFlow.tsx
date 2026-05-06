import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Triggering reload to clear stale cache
import { Listing, isQuoteCategory, BookingStatus } from '../../../types';
import { useAuth } from '../../auth/context/AuthContext';
import { createBooking } from '../../../services/bookingService';
import { createQuoteRequest } from '../../../services/leadService';
import { BookingCalendar } from './BookingCalendar';
import { ReviewsSection } from '../../marketplace/components/ReviewsSection';
import { ChatWindow } from '../../messaging/components/ChatWindow';

interface BookingFlowProps {
 vehicle: Listing;
 onBack: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ vehicle, onBack }) => {
 const navigate = useNavigate();
 const isHeavy = isQuoteCategory(vehicle.category);
 const { currentUser } = useAuth();
 const [success, setSuccess] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 
 const [showChat, setShowChat] = useState(false);
 const [dateRange, setDateRange] = useState({ start: '', end: '', days: 0 });
 const [projectDetails, setProjectDetails] = useState({ location: '', scope: '', duration: '' });

 const handleProceedToBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to connect with a renter.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (isHeavy) {
        await createQuoteRequest({
          listingId: vehicle.id,
          consumerId: currentUser!.id,
          consumerName: currentUser!.name || 'Anonymous',
          consumerEmail: currentUser!.email || '',
          consumerPhone: 'Not Provided',
          projectLocation: projectDetails.location,
          duration: `${dateRange.days} days`,
          requestedStartDate: dateRange.start,
          requestedEndDate: dateRange.end,
          scopeOfWork: projectDetails.scope,
          status: 'new'
        });
      } else {
        if (!dateRange.start || !dateRange.end) {
          setError('Please select rental dates.');
          setLoading(false);
          return;
        }

        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        const totalPrice = (vehicle.dailyRate || 0) * days;
        
        await createBooking({
          listingId: vehicle.id,
          listingName: `${vehicle.make} ${vehicle.model}`,
          agentId: vehicle.agentId,
          agentName: vehicle.agentName,
          consumerId: currentUser!.id,
          consumerName: currentUser!.name || 'Anonymous',
          consumerEmail: currentUser!.email || '',
          consumerPhone: 'Not Provided',
          startDate: dateRange.start,
          endDate: dateRange.end,
          totalPrice,
          status: 'pending' as BookingStatus,
        });
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect with renter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center animate-fade-in">
        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 rotate-3">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
          Booking Request Sent!
        </h2>
        <p className="text-slate-500 text-lg mb-12 max-w-lg mx-auto font-medium">
          Your booking request for the {vehicle.make} {vehicle.model} has been transmitted to {vehicle.agentName}. 
          Start a chat now to finalize logistics and confirm availability.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/messages', { state: { recipientId: vehicle.agentId, recipientName: vehicle.agentName } })}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl transition-all shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Open Messages
          </button>
          <button 
            onClick={onBack}
            className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest rounded-3xl transition-all hover:bg-slate-50"
          >
            Return to Results
          </button>
        </div>

        {showChat && (
          <div className="fixed inset-0 z-50 md:inset-auto md:bottom-8 md:right-8 animate-slide-up">
            <ChatWindow
              recipientId={vehicle.agentId}
              recipientName={vehicle.agentName}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>
    );
  }

 return (
 <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
 <button 
 onClick={onBack} 
 className="flex items-center gap-4 text-slate-500 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-12 group transition-colors"
 >
 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-indigo-500/50 shadow-sm transition-all group-hover:-translate-x-1">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
 </svg>
 </div>
 Back to Results
 </button>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
 {/* Left Column: Vehicle Details */}
 <div className="lg:col-span-12 xl:col-span-7">
 <div className="relative rounded-[48px] overflow-hidden border-4 border-white aspect-video shadow-2xl xl:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] group">
 <img 
 src={vehicle.imageUrls[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
 alt={vehicle.model} 
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
 />
 <div className="absolute top-8 left-8">
 <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-xl shadow-2xl ${
 isHeavy 
 ? 'bg-amber-600/20 text-amber-100 border-amber-600/30' 
 : 'bg-indigo-600/20 text-white border-indigo-600/30'
 }`}>
 {vehicle.category}
 </span>
 </div>
 </div>

 <div className="mt-12">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
 <div>
 <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
 {vehicle.make} <span className="text-indigo-600 ">{vehicle.model}</span>
 </h1>
 <div className="flex flex-wrap items-center gap-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">
 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200 "></div> {vehicle.year}</span>
 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200 "></div> {vehicle.location}</span>
 <span className="flex items-center gap-2 text-indigo-500 "><div className="w-2 h-2 rounded-full bg-indigo-500/50"></div> VERIFIED AGENT</span>
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-slate-100 pt-12">
 <div className="md:col-span-5">
 <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.3em] mb-8 opacity-50">Technical Specs</h3>
 <div className="grid grid-cols-1 gap-3">
 {vehicle.specifications.map((spec, i) => (
 <div key={i} className="flex items-center gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-indigo-500/20 group">
 <div className={`w-1.5 h-1.5 rounded-full group-hover:scale-150 transition-transform ${isHeavy ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
 <span className="text-sm font-bold tracking-tight">{spec}</span>
 </div>
 ))}
 </div>
 </div>
 <div className="md:col-span-7">
 <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.3em] mb-8 opacity-50">Overview</h3>
 <p className="text-slate-600 leading-relaxed text-lg font-medium">
 {vehicle.description}
 </p>
 </div>
 </div>

 {/* Reviews Section */}
 <div className="mt-20 border-t border-slate-100 pt-16">
 <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Community Feedback</h2>
 <ReviewsSection listingId={vehicle.id} />
 </div>
 </div>
 </div>

 {/* Right Column: Dynamic Booking Panel */}
 <div className="lg:col-span-12 xl:col-span-5">
          <div className="bg-white p-8 md:p-12 rounded-[56px] border-2 border-slate-100 sticky top-28 shadow-2xl xl:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.1)] group">
            {currentUser ? (
              isHeavy ? (
                <form onSubmit={handleProceedToBooking} className="space-y-10">
                  <div className="mb-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reserve Equipment</h2>
                    <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest opacity-70">Booking details required</p>
                  </div>

                  {error && (
                    <div className="bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest p-5 rounded-2xl animate-shake">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Project Site Location</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Street, City, Zone..."
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold placeholder:opacity-30"
                        onChange={e => setProjectDetails({...projectDetails, location: e.target.value})}
                      />
                    </div>

                    <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 ">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center opacity-70">Project Timeline</label>
                      <BookingCalendar
                        listingId={vehicle.id}
                        accentColor="amber"
                        onDateChange={(start, end, days) =>
                          setDateRange({ start, end, days })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Scope of Work</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Explain the excavation, grading, or moving tasks..."
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold placeholder:opacity-30 resize-none"
                        onChange={e => setProjectDetails({...projectDetails, scope: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-500/5 p-8 rounded-[40px] border-2 border-amber-500/10 shadow-inner">
                    <div className="flex gap-5">
                      <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-500/30">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <p className="text-[10px] text-amber-700 leading-relaxed font-black uppercase tracking-widest italic">
                        Le'Kiray platform handles lead generation. Direct contracts and payments are handled off-platform with {vehicle.agentName}.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || (isHeavy && !dateRange.days)}
                    className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl transition-all shadow-2xl shadow-amber-900/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-4"
                  >
                    {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {loading ? 'Transmitting Request...' : 'Request Booking'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleProceedToBooking} className="space-y-12">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Reserve</h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Daily Rate Estimate</p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-indigo-600 tracking-tighter shadow-indigo-500/10">{vehicle.dailyRate?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block font-black uppercase tracking-[0.2em] mt-1">ETB / DAY</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest p-5 rounded-2xl animate-shake">
                      {error}
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-[40px] p-6 border border-slate-100 ">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center opacity-70">Proposed Timeline</label>
                    <BookingCalendar
                      listingId={vehicle.id}
                      accentColor="indigo"
                      onDateChange={(start, end, days) =>
                        setDateRange({ start, end, days })
                      }
                    />
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center group">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Daily Rate</span>
                      <div className="flex-grow mx-4 border-b border-dashed border-slate-200 "></div>
                      <span className="text-sm font-black text-slate-900 ">{vehicle.dailyRate?.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Duration</span>
                      <div className="flex-grow mx-4 border-b border-dashed border-slate-200 "></div>
                      <span className="text-sm font-black text-slate-900 ">{dateRange.days || '—'} {dateRange.days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="pt-8 flex justify-between items-end border-t border-slate-100 ">
                      <span className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px] pb-1">Total Estimate</span>
                      <div className="text-right">
                        <span className="text-4xl md:text-5xl font-black text-indigo-600 tracking-tighter">
                          {((vehicle.dailyRate || 0) * (dateRange.days || 1)).toLocaleString()}
                        </span>
                        <span className="text-xs font-black text-slate-400 ml-2">ETB</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-600 text-white p-8 rounded-[40px] shadow-2xl shadow-indigo-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex gap-5 relative z-10">
                      <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30 backdrop-blur-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <p className="text-[10px] text-indigo-50 leading-relaxed font-black uppercase tracking-widest">
                        Connections are free. Finalize contract and payment directly with {vehicle.agentName} after connecting.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !dateRange.days}
                    className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl transition-all shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-30 flex justify-center items-center gap-4"
                  >
                    {loading && <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                    {loading ? 'Connecting...' : 'Request Connection'}
                  </button>
                  {!dateRange.days && (
                    <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">Please select dates to request connection</p>
                  )}
                </form>
              )
            ) : (
              <div className="space-y-12 text-center py-10">
                <div className="w-24 h-24 bg-indigo-500/5 text-indigo-600 rounded-4xl flex items-center justify-center mx-auto mb-10 border-2 border-indigo-500/10 shadow-2xl shadow-indigo-500/5 rotate-3 hover:rotate-0 transition-transform">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Login Required</h2>
                  <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Please identify yourself to reserve this vehicle or request custom logistics.</p>
                </div>
                <div className="flex flex-col gap-5 pt-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl transition-all shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="w-full py-6 bg-white text-slate-900 font-black uppercase tracking-[0.3em] text-[10px] rounded-3xl transition-all border-2 border-slate-100 hover:border-indigo-500/20 active:scale-95"
                  >
                    Create Account
                  </button>
                </div>
                <div className="pt-10 border-t border-slate-50 ">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-60">
                    Trusted Marketplace Infrastructure
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Messaging FAB */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-24 z-40 flex items-center gap-4 px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-[24px] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 active:scale-95 group"
        >
          <div className="relative">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <span className="group-hover:text-indigo-600 transition-colors">Direct Chat</span>
        </button>
      )}

      {/* Sliding Chat Window */}
      {showChat && (
        <div className="fixed inset-0 z-50 md:inset-auto md:bottom-8 md:right-8 animate-slide-up">
          <ChatWindow
            recipientId={vehicle.agentId}
            recipientName={vehicle.agentName}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
};


export default BookingFlow;
