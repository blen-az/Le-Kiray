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
import { QuoteRequest, LeadStatus, VehicleCategory } from '../types';
import { getListing } from './listingService';

const COLLECTION = 'quoteRequests';

/**
 * Get all quote requests (leads) for an agent
 */
export const getLeadsByAgent = async (agentId: string): Promise<QuoteRequest[]> => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('agentId', '==', agentId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuoteRequest));
    } catch (error) {
        console.error('Error fetching leads:', error);
        throw error;
    }
};

/**
 * Get all quote requests for a consumer
 */
export const getLeadsByConsumer = async (consumerId: string): Promise<QuoteRequest[]> => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('consumerId', '==', consumerId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuoteRequest));
    } catch (error) {
        console.error('Error fetching consumer leads:', error);
        throw error;
    }
};

/**
 * Get a single quote request by ID
 */
export const getLead = async (id: string): Promise<QuoteRequest | null> => {
    try {
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        return { id: docSnap.id, ...docSnap.data() } as QuoteRequest;
    } catch (error) {
        console.error('Error fetching lead:', error);
        throw error;
    }
};

/**
 * Create a new quote request
 * ENFORCES: Only allows quote requests for EARTH_MOVING category
 */
export const createQuoteRequest = async (
    data: Omit<QuoteRequest, 'id' | 'createdAt' | 'updatedAt' | 'agentId' | 'listingName'>
): Promise<QuoteRequest> => {
    try {
        // Verify the listing exists and is quote-based
        const listing = await getListing(data.listingId);

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.category !== VehicleCategory.EARTH_MOVING) {
            throw new Error('Quote requests are only for earth-moving equipment. Use booking instead.');
        }

        if (listing.status !== 'active') {
            throw new Error('Listing is not available for quote requests');
        }

        const docRef = doc(collection(db, COLLECTION));
        const timestamp = new Date().toISOString();

        const leadData = {
            ...data,
            agentId: listing.agentId,
            listingName: `${listing.make} ${listing.model}`,
            status: 'new' as LeadStatus,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await setDoc(docRef, leadData);

        return { id: docRef.id, ...leadData };
    } catch (error) {
        console.error('Error creating quote request:', error);
        throw error;
    }
};

/**
 * Update quote request status
 */
export const updateLeadStatus = async (
    id: string,
    status: LeadStatus
): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION, id);

        await updateDoc(docRef, {
            status,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating lead status:', error);
        throw error;
    }
};

/**
 * Get leads by status
 */
export const getLeadsByStatus = async (
    agentId: string,
    status: LeadStatus
): Promise<QuoteRequest[]> => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('agentId', '==', agentId),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuoteRequest));
    } catch (error) {
        console.error('Error fetching leads by status:', error);
        throw error;
    }
};

/**
 * Count new leads for an agent
 */
export const countNewLeads = async (agentId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('agentId', '==', agentId),
            where('status', '==', 'new')
        );
        const snapshot = await getDocs(q);

        return snapshot.size;
    } catch (error) {
        console.error('Error counting new leads:', error);
        throw error;
    }
};
