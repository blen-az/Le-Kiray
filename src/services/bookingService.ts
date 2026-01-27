import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Booking, BookingStatus, VehicleCategory } from '../types';
import { getListing } from './listingService';

const COLLECTION = 'bookings';

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

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
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

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
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

        return { id: docSnap.id, ...docSnap.data() } as Booking;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

/**
 * Create a new booking
 * ENFORCES: Only allows bookings for non-EARTH_MOVING categories
 */
export const createBooking = async (
    data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Booking> => {
    try {
        // Verify the listing exists and is bookable
        const listing = await getListing(data.listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.category === VehicleCategory.EARTH_MOVING) {
            throw new Error('Cannot create booking for earth-moving equipment. Use quote request instead.');
        }

        if (listing.status !== 'active') {
            throw new Error('Listing is not available for booking');
        }

        const docRef = doc(collection(db, COLLECTION));
        const timestamp = new Date().toISOString();

        const bookingData = {
            ...data,
            agentId: listing.agentId,
            listingName: `${listing.make} ${listing.model}`,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await setDoc(docRef, bookingData);

        return { id: docRef.id, ...bookingData };
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
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
            updatedAt: new Date().toISOString(),
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

            const booking = doc.data() as Booking;
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
