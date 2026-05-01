import {
 createUserWithEmailAndPassword,
 signInWithEmailAndPassword,
 signOut,
 onAuthStateChanged,
 User as FirebaseUser
} from 'firebase/auth';
import { 
 doc, 
 getDoc, 
 setDoc, 
 updateDoc, 
 collection, 
 query, 
 where, 
 getDocs,
 onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
export { auth };
import { User, UserRole } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Maps a Firebase Auth user and a Firestore user document to our App User type
 */
export const mapFirebaseUserToAppUser = (
 firebaseUser: FirebaseUser,
 userData: any
): User => {
 const role = (userData?.role?.toUpperCase() as UserRole) || UserRole.CONSUMER;
 return {
 id: firebaseUser.uid,
 email: firebaseUser.email || '',
 name: userData?.name || 'Anonymous User',
 role,
 subscriptionTier: userData?.subscriptionTier,
 companyName: userData?.companyName,
 isApproved: userData?.isApproved ?? (role === UserRole.CONSUMER), // Default true for consumers
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

 // Fetch user data from Firestore by UID
 console.log('Fetching user data from Firestore for UID:', firebaseUser.uid);
 let userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
 let userData = userDoc.exists() ? userDoc.data() : null;

 // Fallback: If UID doc doesn't exist, search by email (for agents with temp IDs)
 if (!userData && firebaseUser.email) {
 console.log('Document not found by UID, searching by email:', firebaseUser.email);
 const q = query(collection(db, USERS_COLLECTION), where('email', '==', firebaseUser.email));
 const querySnapshot = await getDocs(q);
 
 if (!querySnapshot.empty) {
 const tempDoc = querySnapshot.docs[0];
 const tempData = tempDoc.data();
 
 if (tempData.role === UserRole.AGENT) {
 console.log('Found matching agent profile with temp ID. Migrating to UID...', tempDoc.id);
 
 // Auto-migrate to UID
 userData = {
 ...tempData,
 id: firebaseUser.uid,
 updatedAt: new Date().toISOString()
 };
 
 await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
 // Keep the temp doc for audit/invite history or delete it? 
 // Better to delete it to avoid duplicate email lookups later.
 const { deleteDoc } = await import('firebase/firestore');
 await deleteDoc(tempDoc.ref);
 console.log('Auto-migration complete.');
 }
 }
 }

 if (!userData) {
 console.warn('User document not found in Firestore after all checks, creating temporary user object');
 // Try to infer name from email if name is missing
 const nameFromEmail = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User';
 const tempUser: User = {
 id: firebaseUser.uid,
 email: firebaseUser.email || '',
 name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
 role: UserRole.CONSUMER, // Default to consumer for unknown users
 };
 return tempUser;
 }

 const appUser = mapFirebaseUserToAppUser(firebaseUser, userData);
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
 let userData = await getUserDoc(firebaseUser.uid);
 
 // Self-healing: if doc doesn't exist by UID, try email
 if (!userData && firebaseUser.email) {
 console.log('Restoring session: UID doc missing, checking email for agent migration...', firebaseUser.email);
 const q = query(collection(db, USERS_COLLECTION), where('email', '==', firebaseUser.email));
 const querySnapshot = await getDocs(q);
 
 if (!querySnapshot.empty) {
 const tempDoc = querySnapshot.docs[0];
 const tempData = tempDoc.data();
 
 if (tempData.role === UserRole.AGENT) {
 userData = {
 ...tempData,
 id: firebaseUser.uid,
 updatedAt: new Date().toISOString()
 };
 await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
 const { deleteDoc } = await import('firebase/firestore');
 await deleteDoc(tempDoc.ref);
 console.log('Session-based auto-migration complete.');
 }
 }
 }

 if (userData) {
 callback(mapFirebaseUserToAppUser(firebaseUser, userData));
 } else {
 // If doc doesn't exist yet, it might be a new signup in progress.
 // We provide a minimal user but don't force a role if possible,
 // however our User type requires it. 
 callback({
 id: firebaseUser.uid,
 email: firebaseUser.email || '',
 name: firebaseUser.displayName || 'User',
 role: UserRole.CONSUMER,
 });
 }
 } else {
 callback(null);
 }
 });
};

/**
 * Subscribe to real-time user document updates
 */
export const subscribeToUserDoc = (
 uid: string, 
 firebaseUser: FirebaseUser,
 callback: (user: User | null) => void
) => {
 return onSnapshot(doc(db, USERS_COLLECTION, uid), async (docSnapshot) => {
 if (docSnapshot.exists()) {
 callback(mapFirebaseUserToAppUser(firebaseUser, docSnapshot.data()));
 } else {
 // Self-healing in listener: if doc doesn't exist by UID, try email
 if (firebaseUser.email) {
 console.log('Listener notice: UID doc missing, checking email for migration...', firebaseUser.email);
 const q = query(collection(db, USERS_COLLECTION), where('email', '==', firebaseUser.email));
 const querySnapshot = await getDocs(q);
 
 if (!querySnapshot.empty) {
 const tempDoc = querySnapshot.docs[0];
 const tempData = tempDoc.data();
 
 if (tempData.role === UserRole.AGENT) {
 const migratedData = {
 ...tempData,
 id: firebaseUser.uid,
 updatedAt: new Date().toISOString()
 };
 console.log('Listener auto-migrating agent document to UID:', firebaseUser.uid);
 await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), migratedData);
 const { deleteDoc } = await import('firebase/firestore');
 await deleteDoc(tempDoc.ref);
 // The next snapshot will fire with the new doc, so we don't need to call callback here manualy
 return;
 }
 }
 }

 // Fallback for real consumers or if migration not possible
 // Note: During signup, this might fire before setDoc finishes.
 // Component should handle this by checking if user.role is confirmed.
 callback({
 id: firebaseUser.uid,
 email: firebaseUser.email || '',
 name: firebaseUser.displayName || 'User',
 role: UserRole.CONSUMER,
 });
 }
 }, (error) => {
 console.error('Error listening to user doc:', error);
 });
};
