import {
 collection,
 doc,
 getDoc,
 getDocs,
 setDoc,
 updateDoc,
 query,
 where,
 orderBy,
 Timestamp
} from 'firebase/firestore';
import { db, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Booking, BookingStatus, VehicleCategory } from '../types';
import { getListing } from './listingService';

const COLLECTION = 'bookings';

/**
 * Helper to map Firestore booking data to App Booking type
 * Converts Firestore Timestamps back to ISO strings for the UI
 */
const mapBookingDoc = (id: string, data: any): Booking => {
 return {
 ...data,
 id,
 startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
 endDate: data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
 createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
 updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
 } as Booking;
};

/**
 * Get all bookings for an agent
 */
export const getBookingsByAgent = async (agentId: string): Promise<Booking[]> => {
 try {
 const q = query(
 collection(db, COLLECTION),
 where('agentId', '==', agentId),
 orderBy('createdAt', 'desc')
 );
 const snapshot = await getDocs(q);

 return snapshot.docs.map(doc => mapBookingDoc(doc.id, doc.data()));
 } catch (error) {
 console.error('Error fetching bookings:', error);
 throw error;
 }
};

/**
 * Get all bookings for a consumer
 */
export const getBookingsByConsumer = async (consumerId: string): Promise<Booking[]> => {
 try {
 const q = query(
 collection(db, COLLECTION),
 where('consumerId', '==', consumerId),
 orderBy('createdAt', 'desc')
 );
 const snapshot = await getDocs(q);

 return snapshot.docs.map(doc => mapBookingDoc(doc.id, doc.data()));
 } catch (error) {
 console.error('Error fetching consumer bookings:', error);
 throw error;
 }
};

/**
 * Get a single booking by ID
 */
export const getBooking = async (id: string): Promise<Booking | null> => {
 try {
 const docRef = doc(db, COLLECTION, id);
 const docSnap = await getDoc(docRef);

 if (!docSnap.exists()) return null;

 return mapBookingDoc(docSnap.id, docSnap.data());
 } catch (error) {
 console.error('Error fetching booking:', error);
 throw error;
 }
};

/**
 * Create a new booking
 */
export const createBooking = async (
  data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Booking> => {
  try {
    // 1. Check for conflicts first
    const conflict = await hasDateConflict(data.listingId, data.startDate, data.endDate);
    if (conflict) {
      throw new Error('These dates are already reserved. Please select different dates.');
    }

    // 2. Create the document
    const docRef = doc(collection(db, COLLECTION));
    const timestamp = Timestamp.now();
    
    const bookingData = {
      ...data,
      status: 'pending' as BookingStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(docRef, bookingData);

    return mapBookingDoc(docRef.id, bookingData);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw new Error(error.message || 'Failed to create reservation.');
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
 id: string,
 status: BookingStatus,
 cancelReason?: string
): Promise<void> => {
 try {
 const docRef = doc(db, COLLECTION, id);

 const updateData: Record<string, unknown> = {
 status,
 updatedAt: Timestamp.now(),
 };

 if (status === 'cancelled' && cancelReason) {
 updateData.cancelReason = cancelReason;
 }

 await updateDoc(docRef, updateData);
 } catch (error) {
 console.error('Error updating booking status:', error);
 throw error;
 }
};

/**
 * Check for date conflicts with existing bookings
 */
export const hasDateConflict = async (
 listingId: string,
 startDate: string,
 endDate: string,
 excludeBookingId?: string
): Promise<boolean> => {
 try {
 const q = query(
 collection(db, COLLECTION),
 where('listingId', '==', listingId),
 where('status', 'in', ['pending', 'confirmed', 'in_progress'])
 );
 const snapshot = await getDocs(q);

 const start = new Date(startDate);
 const end = new Date(endDate);

 for (const doc of snapshot.docs) {
 if (excludeBookingId && doc.id === excludeBookingId) continue;

 const booking = mapBookingDoc(doc.id, doc.data());
 const bookingStart = new Date(booking.startDate);
 const bookingEnd = new Date(booking.endDate);

 // Check for overlap
 if (start <= bookingEnd && end >= bookingStart) {
 return true;
 }
 }

 return false;
 } catch (error) {
 console.error('Error checking date conflict:', error);
 throw error;
 }
};
