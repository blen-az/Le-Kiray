import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
        isApproved: userData?.isApproved ?? (userData?.role === UserRole.CONSUMER), // Default true for consumers
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
        console.log('Starting signup process...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created in Firebase Auth:', userCredential.user.uid);
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
        console.log('Saving user data to Firestore...');
        await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
        console.log('User data saved successfully');

        return mapFirebaseUserToAppUser(firebaseUser, userData);
    } catch (error: any) {
        console.error('Error during sign up:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        throw new Error(error.message || 'Failed to create account. Please try again.');
    }
};

/**
 * Sign in existing user
 */
export const login = async (email: string, password: string): Promise<User> => {
    try {
        console.log('Starting login for email:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User authenticated:', userCredential.user.uid);
        const firebaseUser = userCredential.user;

        // Fetch user data from Firestore by UID first
        console.log('Fetching user data from Firestore...');
        let userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));

        // If not found by UID, try searching by email
        if (!userDoc.exists()) {
            console.log('User not found by UID, searching by email...');
            const q = query(
                collection(db, USERS_COLLECTION),
                where('email', '==', firebaseUser.email)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.warn('User document not found in Firestore, creating minimal user');
                const minimalUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: 'User',
                    role: UserRole.CONSUMER,
                };
                return minimalUser;
            }

            userDoc = querySnapshot.docs[0];
        }

        const appUser = mapFirebaseUserToAppUser(firebaseUser, userDoc.data());
        console.log('User logged in successfully, role:', appUser.role);
        return appUser;
    } catch (error: any) {
        console.error('Error during login:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
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
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                console.log('Auth state changed, fetching user doc for:', firebaseUser.uid);
                let userData = await getUserDoc(firebaseUser.uid);

                // If not found by UID, try searching by email (for agents created via onboarding)
                if (!userData && firebaseUser.email) {
                    console.log('User not found by UID, searching by email...');
                    const q = query(
                        collection(db, USERS_COLLECTION),
                        where('email', '==', firebaseUser.email)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        userData = querySnapshot.docs[0].data();
                        console.log('User found by email:', userData.role);
                    }
                }

                if (userData) {
                    callback(mapFirebaseUserToAppUser(firebaseUser, userData));
                } else {
                    // User doc doesn't exist yet, create a minimal user from auth
                    console.warn('User document not found, creating from auth data');
                    const minimalUser: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: 'User',
                        role: UserRole.CONSUMER,
                    };
                    callback(minimalUser);
                }
            } catch (error: any) {
                console.error('AuthService: Error fetching user doc:', error);
                // Even if Firestore is offline, allow the user to proceed with minimal data
                if (error.code === 'failed-precondition' || error.message?.includes('offline')) {
                    console.warn('Firestore offline, proceeding with auth-only user');
                    const minimalUser: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: 'User',
                        role: UserRole.CONSUMER,
                    };
                    callback(minimalUser);
                } else {
                    callback(null);
                }
            }
        } else {
            callback(null);
        }
    });
};
