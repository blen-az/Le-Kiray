import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, UserRole } from '../../../types';
import { getBookingsByAgent, getBookingsByConsumer, updateBookingStatus } from '../../../services/bookingService';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS: { value: BookingStatus; label: string; colorClass: string; lightColorClass: string }[] = [
  { value: 'pending', label: 'Pending', colorClass: 'bg-amber-500', lightColorClass: 'bg-amber-50 text-amber-600 border border-amber-200/50' },
  { value: 'confirmed', label: 'Confirmed', colorClass: 'bg-brand-main', lightColorClass: 'bg-blue-50 text-brand-main border border-blue-200/50' },
  { value: 'in_progress', label: 'Active', colorClass: 'bg-blue-600', lightColorClass: 'bg-indigo-50 text-indigo-600 border border-indigo-200/50' },
  { value: 'completed', label: 'Completed', colorClass: 'bg-emerald-600', lightColorClass: 'bg-emerald-50 text-emerald-650 border border-emerald-200/50' },
  { value: 'cancelled', label: 'Cancelled', colorClass: 'bg-red-600', lightColorClass: 'bg-rose-50 text-rose-600 border border-rose-200/50' },
];

const BookingsPage: React.FC = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || '';
  const isAgent = user?.role === UserRole.AGENT;
  
  if (!user) return null;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'completed' | 'cancelled'>('current');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, [userId, isAgent]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = isAgent 
        ? await getBookingsByAgent(userId)
        : await getBookingsByConsumer(userId);
      setBookings(data);
      if (data.length > 0) {
        setSelectedBooking(data[0]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Group bookings by custom tab filters
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'current') return b.status === 'in_progress';
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getStatusClasses = (status: BookingStatus) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option?.lightColorClass || 'bg-slate-50 text-slate-650 border border-slate-200';
  };

  const getRemainingDays = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 blueprint-grid">
        <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#F8FAFC] blueprint-grid-lg animate-fade-in font-sans pb-24">
      {/* Header */}
      <div className="mb-8 max-w-4xl mx-auto">
        <p className="text-[10px] font-black text-[#FF8A00] uppercase tracking-[0.2em] mb-1">FLEET COMMAND LOGS</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Lease Operations
        </h1>
        <p className="text-slate-500 text-xs font-semibold">Coordinate contract scopes, delivery tracking, and logistics timelines</p>
      </div>

      {/* Tab Selectors (Floating segment style) */}
      <div className="bg-white border border-slate-100 p-1.5 rounded-[20px] flex gap-1 mb-8 shadow-dribbble max-w-4xl mx-auto overflow-x-auto scrollbar-none">
        {[
          { key: 'current', label: 'Active Contracts', count: bookings.filter(b => b.status === 'in_progress').length },
          { key: 'upcoming', label: 'Upcoming Deployments', count: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length },
          { key: 'completed', label: 'Completed Scopes', count: bookings.filter(b => b.status === 'completed').length },
          { key: 'cancelled', label: 'Cancelled Operations', count: bookings.filter(b => b.status === 'cancelled').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              const list = bookings.filter(b => {
                if (tab.key === 'current') return b.status === 'in_progress';
                if (tab.key === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
                if (tab.key === 'completed') return b.status === 'completed';
                if (tab.key === 'cancelled') return b.status === 'cancelled';
                return true;
              });
              setSelectedBooking(list[0] || null);
            }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-brand-main text-white shadow-md shadow-brand-main/15'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-4xl mx-auto">
        
        {/* Left Side: Booking List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`bg-white border-[1.5px] rounded-[28px] p-6 cursor-pointer transition-all shadow-dribbble flex flex-col justify-between h-[160px] hover:border-brand-main/20 relative overflow-hidden ${
                  selectedBooking?.id === booking.id
                    ? 'border-brand-main ring-4 ring-brand-main/5'
                    : 'border-slate-100'
                }`}
              >
                {/* Cad detail accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-main" />

                <div className="flex justify-between items-start pl-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-md tracking-tight truncate max-w-[220px]">{booking.listingName}</h3>
                    <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mt-1">
                      {isAgent ? `Contractor: ${booking.consumerName}` : `Supplier: ${booking.agentName || 'Verified Agent'}`}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border ${getStatusClasses(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-end pl-2 pt-4 border-t border-slate-50">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Lease Window</p>
                    <p className="text-slate-800 text-xs font-black">{booking.startDate} → {booking.endDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pricing Scope</p>
                    <p className="text-sm font-black text-brand-main">{booking.totalPrice.toLocaleString()} ETB</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-[28px] p-12 text-center shadow-premium dots-grid">
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">No matching contracts</h3>
              <p className="text-slate-400 text-xs font-semibold mt-1">There are no operational files matching this lease state.</p>
            </div>
          )}
        </div>

        {/* Right Side: Detailed selected booking sheet */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 sticky top-28 shadow-dribbble space-y-6">
              
              {/* Header Details */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-[#FF8A00] uppercase tracking-widest">CONTRACT CARD</p>
                  <h3 className="text-md font-black text-slate-900 tracking-tight">Scope Summary</h3>
                </div>
                <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                  Ref: #{selectedBooking.id.substring(0, 6).toUpperCase()}
                </span>
              </div>

              {/* Machinery Display */}
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">LEASED VEHICLE</span>
                <h4 className="text-md font-black text-slate-900 tracking-tight mt-0.5">{selectedBooking.listingName}</h4>
              </div>

              {/* Asset Countdown Timer */}
              {selectedBooking.status === 'in_progress' && (
                <div className="bg-brand-main/5 border border-brand-main/15 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-brand-main uppercase tracking-widest">REMAINING CONTRACT TIME</span>
                    <p className="text-xs text-slate-500 font-semibold">Active operational lease window</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-brand-main block leading-none">{getRemainingDays(selectedBooking.endDate)}</span>
                    <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest mt-0.5">Days</span>
                  </div>
                </div>
              )}

              {/* Live Delivery Tracking Flowchart */}
              <div className="space-y-3">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">MOBILIZATION PIPELINE</span>
                <div className="relative pl-6 space-y-4 pt-1">
                  {/* Flowline */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-slate-150" />
                  
                  {[
                    { label: 'Contract Execution & Verification', desc: 'Mobilization checklists verified.', active: true },
                    { label: 'Logistics Dispatch & Transit', desc: 'Transit route authorization complete.', active: selectedBooking.status !== 'pending' },
                    { label: 'Operational On-Site Handover', desc: 'Asset deployed at project coordinates.', active: selectedBooking.status === 'in_progress' || selectedBooking.status === 'completed' },
                  ].map((step, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className={`absolute left-[-23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                        step.active ? 'border-brand-main ring-4 ring-brand-main/5' : 'border-slate-200'
                      }`}>
                        {step.active && <div className="w-1.5 h-1.5 bg-brand-main rounded-full" />}
                      </div>
                      <h5 className={`text-[11px] font-black tracking-tight ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h5>
                      <p className="text-[10px] text-slate-400 font-medium leading-normal">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Vault & Invoice Panel */}
              <div className="space-y-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">DOCUMENT VAULT</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-800 truncate leading-none">Tax Invoice INV-{selectedBooking.id.substring(0, 5).toUpperCase()}</p>
                      <p className="text-[8px] text-slate-400 font-semibold uppercase mt-1">PDF File • 120 KB</p>
                    </div>
                    <button 
                      onClick={() => alert('Downloading tax invoice...')}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-600 hover:border-brand-main hover:text-brand-main transition-colors cursor-pointer shrink-0"
                    >
                      Download
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-800 truncate leading-none">Lease Contract Policy</p>
                      <p className="text-[8px] text-slate-400 font-semibold uppercase mt-1">Secure Sign • 2.4 MB</p>
                    </div>
                    <button 
                      onClick={() => alert('Opening contract policy...')}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-600 hover:border-brand-main hover:text-brand-main transition-colors cursor-pointer shrink-0"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Action Controls */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {isAgent ? (
                  /* Agent Controls */
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">UPDATE PIPELINE STATE</span>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.filter(s => s.value !== selectedBooking.status).map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(selectedBooking.id, opt.value)}
                          className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${opt.lightColorClass} hover:opacity-95 cursor-pointer`}
                        >
                          Mark {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Consumer Controls */
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/messages', { state: { recipientId: selectedBooking.agentId, recipientName: selectedBooking.agentName } })}
                      className="flex-1 py-3 bg-brand-main hover:bg-brand-main/95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-main/15 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      Message Supplier
                    </button>
                    {selectedBooking.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                        className="px-4 py-3 bg-slate-100 hover:bg-red-50 hover:text-red-650 hover:border-red-200 border border-transparent text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-[28px] p-8 text-center shadow-premium dots-grid">
              <p className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Select a lease contract from the log list to inspect.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingsPage;
