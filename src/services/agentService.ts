import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AgentProfile } from '../types';

const COLLECTION = 'agentProfiles';

/**
 * Get agent profile by user ID
 */
export const getAgentProfile = async (userId: string): Promise<AgentProfile | null> => {
    try {
        const q = query(collection(db, COLLECTION), where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const docData = snapshot.docs[0];
        return { id: docData.id, ...docData.data() } as AgentProfile;
    } catch (error) {
        console.error('Error fetching agent profile:', error);
        throw error;
    }
};

/**
 * Get agent profile by document ID
 */
export const getAgentProfileById = async (id: string): Promise<AgentProfile | null> => {
    try {
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        return { id: docSnap.id, ...docSnap.data() } as AgentProfile;
    } catch (error) {
        console.error('Error fetching agent profile by ID:', error);
        throw error;
    }
};

/**
 * Create a new agent profile
 */
export const createAgentProfile = async (
    data: Omit<AgentProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AgentProfile> => {
    try {
        const docRef = doc(collection(db, COLLECTION));
        const timestamp = new Date().toISOString();

        const profileData = {
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await setDoc(docRef, profileData);

        return { id: docRef.id, ...profileData };
    } catch (error) {
        console.error('Error creating agent profile:', error);
        throw error;
    }
};

/**
 * Update an existing agent profile
 */
export const updateAgentProfile = async (
    id: string,
    data: Partial<Omit<AgentProfile, 'id' | 'createdAt'>>
): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION, id);

        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating agent profile:', error);
        throw error;
    }
};

/**
 * Check if user has an agent profile
 */
export const hasAgentProfile = async (userId: string): Promise<boolean> => {
    const profile = await getAgentProfile(userId);
    return profile !== null;
};
