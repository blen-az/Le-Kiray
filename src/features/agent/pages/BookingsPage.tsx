import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../../types';
import { getBookingsByAgent, updateBookingStatus } from '../../../services/bookingService';

interface BookingsPageProps {
  agentId: string;
}

const STATUS_OPTIONS: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'confirmed', label: 'Confirmed', color: 'indigo' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'emerald' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const BookingsPage: React.FC<BookingsPageProps> = ({ agentId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, [agentId]);

  const loadBookings = async () => {
    try {
      const data = await getBookingsByAgent(agentId);
      setBookings(data);
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

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  const getStatusColor = (status: BookingStatus) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option?.color || 'slate';
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
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Bookings</h1>
        <p className="text-slate-500 mt-1">Manage reservations for cars and vans</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          All ({bookings.length})
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = bookings.filter(b => b.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === opt.value ? `bg-${opt.color}-600 text-white` : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <div 
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`bg-slate-900 border rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedBooking?.id === booking.id ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{booking.listingName}</h3>
                    <p className="text-sm text-slate-500">{booking.consumerName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase bg-${getStatusColor(booking.status)}-500/10 text-${getStatusColor(booking.status)}-500`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Dates</p>
                    <p className="text-white font-medium">{booking.startDate} → {booking.endDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Total</p>
                    <p className="text-indigo-400 font-bold">{booking.totalPrice.toLocaleString()} ETB</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2">No bookings yet</h3>
              <p className="text-slate-500">Bookings will appear here when customers reserve your vehicles.</p>
            </div>
          )}
        </div>

        {/* Booking Detail */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-black text-white mb-6">Booking Details</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Vehicle</p>
                  <p className="text-white font-bold">{selectedBooking.listingName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-white font-bold">{selectedBooking.consumerName}</p>
                  <p className="text-sm text-slate-400">{selectedBooking.consumerEmail}</p>
                  <p className="text-sm text-slate-400">{selectedBooking.consumerPhone}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Start</p>
                    <p className="text-white font-medium">{selectedBooking.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">End</p>
                    <p className="text-white font-medium">{selectedBooking.endDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Price</p>
                  <p className="text-2xl font-black text-indigo-400">{selectedBooking.totalPrice.toLocaleString()} ETB</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.filter(s => s.value !== selectedBooking.status).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(selectedBooking.id, opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold bg-${opt.color}-500/10 text-${opt.color}-500 hover:bg-${opt.color}-500/20 transition-colors`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm">Select a booking to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
