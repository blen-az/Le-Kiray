import {
 collection,
 doc,
 getDoc,
 getDocs,
 setDoc,
 updateDoc,
 deleteDoc,
 query,
 where,
 orderBy,
 limit,
 startAfter
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing, ListingStatus, VehicleCategory, isBookableCategory } from '../types';

const COLLECTION = 'listings';

export const getListings = async (
 category?: VehicleCategory,
 pageSize: number = 10,
 lastVisibleDoc: any = null
): Promise<{ listings: Listing[]; lastVisible: any; hasNextPage: boolean }> => {
 // Removed orderBy to avoid Firestore index requirement
 let q = query(collection(db, 'listings'), where('status', '==', 'active'));

 if (category) {
 q = query(collection(db, 'listings'), where('status', '==', 'active'), where('category', '==', category));
 }

 // Since we are sorting in-memory, we fetch more items to handle pagination
 // Note: For a very large database, this would need a real index.
 // But for this scale, fetching a larger buffer or the whole active set is safer.
 const querySnapshot = await getDocs(q);
 let allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));

 // Sort in-memory
 allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

 // Simple pagination logic for the sorted array
 const startIndex = lastVisibleDoc ? allDocs.findIndex(d => d.id === lastVisibleDoc.id) + 1 : 0;
 const paginatedListings = allDocs.slice(startIndex, startIndex + pageSize);
 const hasNextPage = allDocs.length > startIndex + pageSize;
 const lastVisible = paginatedListings.length > 0 ? paginatedListings[paginatedListings.length - 1] : null;

 return {
 listings: paginatedListings,
 lastVisible,
 hasNextPage
 };
};

/**
 * Fetch featured listings (first 6 active)
 */
export const getFeaturedListings = async (): Promise<Listing[]> => {
 const q = query(
 collection(db, 'listings'),
 where('status', '==', 'active')
 );

 const querySnapshot = await getDocs(q);
 const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
 
 // Sort in-memory and limit to 6
 return listings
 .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
 .slice(0, 6);
};

/**
 * Get all listings for an agent
 */
export const getListingsByAgent = async (agentId: string): Promise<Listing[]> => {
 try {
 const q = query(
 collection(db, COLLECTION),
 where('agentId', '==', agentId),
 orderBy('createdAt', 'desc')
 );
 const snapshot = await getDocs(q);

 return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
 } catch (error) {
 console.error('Error fetching listings:', error);
 throw error;
 }
};

/**
 * Get a single listing by ID
 */
export const getListing = async (id: string): Promise<Listing | null> => {
 try {
 const docRef = doc(db, COLLECTION, id);
 const docSnap = await getDoc(docRef);

 if (!docSnap.exists()) return null;

 return { id: docSnap.id, ...docSnap.data() } as Listing;
 } catch (error) {
 console.error('Error fetching listing:', error);
 throw error;
 }
};

/**
 * Get all active listings (for marketplace)
 */
export const getActiveListings = async (): Promise<Listing[]> => {
 try {
 const q = query(
 collection(db, COLLECTION),
 where('status', '==', 'active')
 );
 const snapshot = await getDocs(q);
 const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
 
 // Sort in-memory
 return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
 } catch (error) {
 console.error('Error fetching active listings:', error);
 throw error;
 }
};

/**
 * Create a new listing with category enforcement
 */
export const createListing = async (
 data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Listing> => {
 try {
 // Enforce category rules
 const listingData = enforceCategoryRules(data);

 const docRef = doc(collection(db, COLLECTION));
 const timestamp = new Date().toISOString();

 const fullData = {
 ...listingData,
 createdAt: timestamp,
 updatedAt: timestamp,
 };

 await setDoc(docRef, fullData);

 return { id: docRef.id, ...fullData };
 } catch (error) {
 console.error('Error creating listing:', error);
 throw error;
 }
};

/**
 * Update an existing listing
 */
export const updateListing = async (
 id: string,
 data: Partial<Omit<Listing, 'id' | 'createdAt'>>
): Promise<void> => {
 try {
 const docRef = doc(db, COLLECTION, id);

 // If category is being updated, enforce rules
 let updateData = { ...data };
 if (data.category) {
 updateData = enforceCategoryRules(updateData as Listing);
 }

 await updateDoc(docRef, {
 ...updateData,
 updatedAt: new Date().toISOString(),
 });
 } catch (error) {
 console.error('Error updating listing:', error);
 throw error;
 }
};

/**
 * Update listing status
 */
export const updateListingStatus = async (
 id: string,
 status: ListingStatus
): Promise<void> => {
 try {
 const docRef = doc(db, COLLECTION, id);

 await updateDoc(docRef, {
 status,
 updatedAt: new Date().toISOString(),
 });
 } catch (error) {
 console.error('Error updating listing status:', error);
 throw error;
 }
};

/**
 * Delete a listing (soft delete by archiving)
 */
export const archiveListing = async (id: string): Promise<void> => {
 return updateListingStatus(id, 'archived');
};

/**
 * Count active listings for an agent (for subscription limits)
 */
export const countActiveListings = async (agentId: string): Promise<number> => {
 try {
 const q = query(
 collection(db, COLLECTION),
 where('agentId', '==', agentId),
 where('status', 'in', ['active', 'pending_review'])
 );
 const snapshot = await getDocs(q);

 return snapshot.size;
 } catch (error) {
 console.error('Error counting active listings:', error);
 throw error;
 }
};

/**
 * Enforce category-specific rules on listing data
 * - EARTH_MOVING: Remove pricing fields
 * - Cars/Vans: Ensure pricing exists
 */
const enforceCategoryRules = <T extends Partial<Listing>>(data: T): T => {
 const result = { ...data };

 if (data.category === VehicleCategory.EARTH_MOVING) {
 // Remove pricing fields for earth-moving equipment
 delete result.dailyRate;
 delete result.weeklyRate;
 }

 return result;
};

/**
 * Validate listing can be published
 */
export const validateListingForPublish = (listing: Partial<Listing>): string[] => {
 const errors: string[] = [];

 if (!listing.make) errors.push('Make is required');
 if (!listing.model) errors.push('Model is required');
 if (!listing.year) errors.push('Year is required');
 if (!listing.category) errors.push('Category is required');
 if (!listing.location) errors.push('Location is required');
 if (!listing.description) errors.push('Description is required');
 if (!listing.imageUrls || listing.imageUrls.length === 0) {
 errors.push('At least one image is required');
 }

 // Category-specific validation
 if (listing.category && isBookableCategory(listing.category)) {
 if (!listing.dailyRate || listing.dailyRate <= 0) {
 errors.push('Daily rate is required for cars and vans');
 }
 }

 return errors;
};
