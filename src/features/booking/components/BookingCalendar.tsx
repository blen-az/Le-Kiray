import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingCalendarProps {
 listingId: string;
 accentColor?: 'indigo' | 'amber';
 onDateChange: (start: string, end: string, totalDays: number) => void;
}

interface BookedRange {
 start: Date;
 end: Date;
}

const fetchBookedDates = async (listingId: string): Promise<BookedRange[]> => {
 const q = query(
 collection(db, 'bookings'),
 where('listingId', '==', listingId),
 where('status', 'in', ['pending', 'confirmed', 'in_progress'])
 );
 const snapshot = await getDocs(q);
 return snapshot.docs.map(doc => {
 const d = doc.data();
 const start = d.startDate instanceof Timestamp ? d.startDate.toDate() : parseISO(d.startDate);
 const end = d.endDate instanceof Timestamp ? d.endDate.toDate() : parseISO(d.endDate);
 return { start, end };
 });
};

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
 listingId,
 accentColor = 'indigo',
 onDateChange,
}) => {
 const [startDate, setStartDate] = useState<Date | null>(null);
 const [endDate, setEndDate] = useState<Date | null>(null);

 const { data: bookedRanges = [] } = useQuery({
 queryKey: ['bookedDates', listingId],
 queryFn: () => fetchBookedDates(listingId),
 staleTime: 1000 * 60, // 1 minute cache
 });

 // Build a flat set of all booked day strings e.g. "2024-01-05"
 const bookedDaySet = new Set<string>();
 bookedRanges.forEach(({ start, end }) => {
 eachDayOfInterval({ start, end }).forEach(day => {
 bookedDaySet.add(day.toDateString());
 });
 });

 const isDateBooked = (date: Date): boolean => bookedDaySet.has(date.toDateString());

 const handleChange = (dates: [Date | null, Date | null]) => {
 const [start, end] = dates;
 setStartDate(start);
 setEndDate(end);
 if (start && end) {
 const days = Math.max(
 1,
 Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
 );
 const toISO = (d: Date) => d.toISOString().split('T')[0];
 onDateChange(toISO(start), toISO(end), days);
 }
 };

 const ring = accentColor === 'amber' ? '#f59e0b' : '#6366f1';

 return (
 <div className="booking-calendar-wrapper w-full">
 <style>{`
  .booking-calendar-wrapper .react-datepicker {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-family: inherit;
  width: 100%;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
  }
  .booking-calendar-wrapper .react-datepicker__month-container { width: 100%; }
  .booking-calendar-wrapper .react-datepicker__header {
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 0;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  }
  .booking-calendar-wrapper .react-datepicker__current-month {
  color: #0f172a;
  font-weight: 900;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  }
  .booking-calendar-wrapper .react-datepicker__day-name {
  color: #94a3b8;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  width: 2.2rem;
  }
  .booking-calendar-wrapper .react-datepicker__day {
  color: #475569;
  border-radius: 12px;
  width: 2.2rem;
  line-height: 2.2rem;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
  }
  .booking-calendar-wrapper .react-datepicker__day:hover {
  background: ${ring}15;
  color: ${ring};
  }
  .booking-calendar-wrapper .react-datepicker__day--selected,
  .booking-calendar-wrapper .react-datepicker__day--range-start,
  .booking-calendar-wrapper .react-datepicker__day--range-end {
  background: ${ring} !important;
  color: white !important;
  border-radius: 12px !important;
  }
  .booking-calendar-wrapper .react-datepicker__day--in-range {
  background: ${ring}10 !important;
  color: ${ring} !important;
  border-radius: 0 !important;
  }
  .booking-calendar-wrapper .react-datepicker__day--disabled {
  color: #cbd5e1 !important;
  background: #f8fafc !important;
  text-decoration: line-through;
  cursor: not-allowed;
  }
  .booking-calendar-wrapper .react-datepicker__navigation-icon::before {
  border-color: #94a3b8;
  }
  .booking-calendar-wrapper .react-datepicker__day--outside-month {
  color: #e2e8f0;
  }
  .booking-calendar-wrapper .react-datepicker__day--today {
  border: 2px solid ${ring}33;
  }
 `}</style>

 <DatePicker
 selected={startDate}
 onChange={handleChange}
 startDate={startDate}
 endDate={endDate}
 selectsRange
 inline
 minDate={new Date()}
 excludeDates={[...bookedDaySet].map(ds => new Date(ds))}
 filterDate={(date) => !isDateBooked(date)}
 />

 {startDate && endDate && (
 <div className={`mt-3 text-center text-xs font-black uppercase tracking-widest ${accentColor === 'amber' ? 'text-amber-400' : 'text-indigo-400'}`}>
 {Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)))} day(s) selected
 </div>
 )}
 </div>
 );
};
