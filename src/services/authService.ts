import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Maps a Firebase Auth user and a Firestore user document to our App User type
 */
export const mapFirebaseUserToAppUser = (
    firebaseUser: FirebaseUser,
    userData: any
): User => {
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData?.name || 'Anonymous User',
        role: (userData?.role as UserRole) || UserRole.CONSUMER,
        subscriptionTier: userData?.subscriptionTier,
        companyName: userData?.companyName,
        isApproved: userData?.isApproved
    };
};

/**
 * Sign up a new user with email, password, and role
 */
export const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    companyName?: string
): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const userData = {
            id: firebaseUser.uid,
            name,
            email,
            role,
            companyName: companyName || null,
            isApproved: role === UserRole.AGENT ? false : true, // Agents need approval
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Create document in users collection
        await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);

        return mapFirebaseUserToAppUser(firebaseUser, userData);
    } catch (error) {
        console.error('Error during sign up:', error);
        throw error;
    }
};

/**
 * Sign in existing user
 */
export const login = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));

        if (!userDoc.exists()) {
            throw new Error('User document not found in Firestore');
        }

        return mapFirebaseUserToAppUser(firebaseUser, userDoc.data());
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

/**
 * Sign out
 */
export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

/**
 * Get user context from Firestore
 */
export const getUserDoc = async (uid: string): Promise<any> => {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    return userDoc.exists() ? userDoc.data() : null;
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    console.log('AuthService: Setting up onAuthStateChanged listener...');
    return onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('AuthService: onAuthStateChanged event:', firebaseUser ? `UID ${firebaseUser.uid}` : 'null');
        if (firebaseUser) {
            try {
                const userData = await getUserDoc(firebaseUser.uid);
                console.log('AuthService: User data fetched:', userData ? 'found' : 'missing');
                callback(mapFirebaseUserToAppUser(firebaseUser, userData));
            } catch (error) {
                console.error('AuthService: Error fetching user doc:', error);
                callback(null); // Still call callback to clear loading state
            }
        } else {
            callback(null);
        }
    });
};
