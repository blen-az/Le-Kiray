import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="max-w-2xl mx-auto px-6 py-28 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-md">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          Request Transmitted
        </h2>
        <p className="text-slate-500 text-sm mb-10 max-w-md mx-auto font-medium leading-relaxed">
          Your booking inquiry for the {vehicle.make} {vehicle.model} has been sent to {vehicle.agentName}. 
          Open direct chat to negotiate terms and logistics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/messages', { state: { recipientId: vehicle.agentId, recipientName: vehicle.agentName } })}
            className="w-full sm:w-auto px-8 py-4 bg-brand-main hover:bg-brand-main/90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-main/10 hover:shadow-lg hover:-translate-y-0.5"
          >
            Open Live Chat
          </button>
          <button 
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all hover:bg-slate-50 hover:-translate-y-0.5"
          >
            Return to Directory
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
    <div className="w-full px-8 md:px-12 py-8">
      {/* Back Button with CAD Corner accents */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-extrabold text-[10px] uppercase tracking-widest mb-10 transition-colors"
      >
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 hover:border-slate-300 shadow-sm transition-all hover:-translate-x-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </div>
        Back to Listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Vehicle Details */}
        <div className="lg:col-span-7 space-y-12">
          {/* Main Cinematic Image Showcase */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-dribbble group bg-slate-900">
            {/* Background Grid */}
            <div className="absolute inset-0 blueprint-grid opacity-15 z-0" />
            <img 
              src={vehicle.imageUrls[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
              alt={vehicle.model} 
              className="w-full h-full object-cover relative z-10 opacity-95 group-hover:scale-102 transition-transform duration-700 ease-out" 
            />
            <div className="absolute top-4 left-4 z-20">
              <span className="px-3.5 py-1.5 rounded bg-slate-950/85 text-[8px] font-black uppercase tracking-widest border border-white/10 text-white backdrop-blur-md shadow-md">
                {vehicle.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Heading Area */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                  {vehicle.make} <span className="text-brand-main">{vehicle.model}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-5 text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Production Year: {vehicle.year}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Hub: {vehicle.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-brand-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/40 animate-pulse" />
                    Certified Fleet
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tech Specs & Overview Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
              <div className="md:col-span-5">
                <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 gap-3">
                  {vehicle.specifications.map((spec, i) => {
                    const parts = spec.split(':');
                    const label = parts[0]?.trim() || 'Specification';
                    const value = parts[1]?.trim() || spec;
                    return (
                      <div key={i} className="relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-brand-main/15 transition-all">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                          {parts[1] ? label : 'Spec Option'}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {parts[1] ? value : label}
                        </span>
                        <div className="absolute right-3.5 top-3.5 w-1 h-1 rounded-full bg-brand-main/30" />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="md:col-span-7">
                <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Overview</h3>
                <p className="text-slate-600 leading-relaxed text-sm font-medium whitespace-pre-line bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                  {vehicle.description}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 border-t border-slate-100 pt-12">
              <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-wider text-xs">User Feedback</h2>
              <ReviewsSection listingId={vehicle.id} />
            </div>
          </div>
        </div> 

        {/* Right Column: Dynamic Booking Panel */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-2xl border border-slate-150 sticky top-28 shadow-floating transition-all duration-300 hover:border-slate-200">
            {currentUser ? (
              isHeavy ? (
                <form onSubmit={handleProceedToBooking} className="space-y-8">
                  <div className="pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">Reserve Equipment</h2>
                    <p className="text-slate-400 text-[8px] font-black mt-1 uppercase tracking-widest">Inquiry Details Required</p>
                  </div>

                  {error && (
                    <div className="bg-red-50/80 border border-red-200 text-red-600 text-xs font-bold p-4 rounded-xl animate-shake">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Site Location</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Bole, Addis Ababa"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all text-xs font-extrabold placeholder:text-slate-400"
                        onChange={e => setProjectDetails({...projectDetails, location: e.target.value})}
                      />
                    </div>

                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150">
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Project Timeline</label>
                      <BookingCalendar
                        listingId={vehicle.id}
                        accentColor="amber"
                        onDateChange={(start, end, days) =>
                          setDateRange({ start, end, days })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Scope of Work</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Explain the excavation, grading, or moving tasks..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all text-xs font-extrabold placeholder:text-slate-400 resize-none"
                        onChange={e => setProjectDetails({...projectDetails, scope: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-150">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center border border-brand-accent/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
                        Le'Kiray handles connecting leads. Direct logistics and payments are finalized directly with {vehicle.agentName}.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || (isHeavy && !dateRange.days)}
                    className="w-full py-3.5 bg-brand-main hover:bg-brand-main/90 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-brand-main/10 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {loading ? 'Transmitting Request...' : 'Send Booking Request'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleProceedToBooking} className="space-y-6">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 tracking-tight">Reserve</h2>
                      <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-1">Daily Rate Estimate</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-brand-main tracking-tight">{vehicle.dailyRate?.toLocaleString()}</span>
                      <span className="text-[8px] text-slate-400 block font-black uppercase tracking-widest mt-0.5">ETB / DAY</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50/80 border border-red-200 text-red-600 text-xs font-bold p-4 rounded-xl animate-shake">
                      {error}
                    </div>
                  )}

                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150">
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Proposed Timeline</label>
                    <BookingCalendar
                      listingId={vehicle.id}
                      accentColor="indigo"
                      onDateChange={(start, end, days) =>
                        setDateRange({ start, end, days })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <span>Daily Rate</span>
                      <div className="flex-grow mx-4 border-b border-dashed border-slate-200"></div>
                      <span className="text-xs font-extrabold text-slate-800">{vehicle.dailyRate?.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <span>Duration</span>
                      <div className="flex-grow mx-4 border-b border-dashed border-slate-200"></div>
                      <span className="text-xs font-extrabold text-slate-800">{dateRange.days || '—'} {dateRange.days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="pt-5 flex justify-between items-end border-t border-slate-100">
                      <span className="font-black text-slate-400 uppercase tracking-widest text-[9px] pb-0.5">Total Estimate</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-brand-main tracking-tight">
                          {((vehicle.dailyRate || 0) * (dateRange.days || 1)).toLocaleString()}
                        </span>
                        <span className="text-xs font-extrabold text-slate-400 ml-1">ETB</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-150">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-main/10 text-brand-main flex items-center justify-center border border-brand-main/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
                        Connections are free. Finalize logistics and payment directly with the owner after connecting.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !dateRange.days}
                    className="w-full py-3.5 bg-brand-main hover:bg-brand-main/90 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-brand-main/10 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {loading ? 'Connecting...' : 'Request Connection'}
                  </button>
                  {!dateRange.days && (
                    <p className="text-center text-slate-400 text-[8px] font-black uppercase tracking-widest mt-2">Please select dates to request connection</p>
                  )}
                </form>
              )
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-200/60 shadow-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Login Required</h2>
                  <p className="text-slate-400 text-xs font-semibold max-w-[220px] mx-auto leading-relaxed">Please identify yourself to reserve this vehicle or request logistics.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-brand-main hover:bg-brand-main/90 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-md shadow-brand-main/10 hover:-translate-y-0.5"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="w-full py-3 bg-white text-slate-700 font-black uppercase tracking-wider text-xs rounded-xl transition-all border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5"
                  >
                    Create Account
                  </button>
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
          className="fixed bottom-6 right-24 z-40 flex items-center gap-4 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-premium hover:shadow-floating transition-all hover:-translate-y-1 active:scale-95 group"
        >
          <div className="relative">
            <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <span className="transition-colors group-hover:text-brand-accent">Direct Chat</span>
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
