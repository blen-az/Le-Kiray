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
 limit,
 onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../types';
import { countActiveListings } from './listingService';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PLANS_COLLECTION = 'subscriptionPlans';

// Default plans if none exist in Firestore
const DEFAULT_PLANS: SubscriptionPlan[] = [
  // 5 Machineries
  { id: 'em-5-3m', name: 'Basic (3 Months)', maxVehicles: 5, price: 6000, durationMonths: 3, category: 'EARTH_MOVING' },
  { id: 'em-5-6m', name: 'Basic (6 Months)', maxVehicles: 5, price: 11000, durationMonths: 6, category: 'EARTH_MOVING' },
  { id: 'em-5-1y', name: 'Basic (1 Year)', maxVehicles: 5, price: 20000, durationMonths: 12, category: 'EARTH_MOVING' },

  // 15 Machineries
  { id: 'em-15-3m', name: 'Pro (3 Months)', maxVehicles: 15, price: 9000, durationMonths: 3, category: 'EARTH_MOVING' },
  { id: 'em-15-6m', name: 'Pro (6 Months)', maxVehicles: 15, price: 16000, durationMonths: 6, category: 'EARTH_MOVING' },
  { id: 'em-15-1y', name: 'Pro (1 Year)', maxVehicles: 15, price: 30000, durationMonths: 12, category: 'EARTH_MOVING' },

  // Limitless Machineries
  { id: 'em-unl-3m', name: 'Enterprise (3 Months)', maxVehicles: 9999, price: 15000, durationMonths: 3, category: 'EARTH_MOVING' },
  { id: 'em-unl-6m', name: 'Enterprise (6 Months)', maxVehicles: 9999, price: 28000, durationMonths: 6, category: 'EARTH_MOVING' },
  { id: 'em-unl-1y', name: 'Enterprise (1 Year)', maxVehicles: 9999, price: 550000, durationMonths: 12, category: 'EARTH_MOVING' },

  // Contractors / Consumers
  { id: 'con-3m', name: 'Contractor (3 Months)', maxVehicles: 0, price: 6000, durationMonths: 3, category: 'CONSUMER' },
  { id: 'con-6m', name: 'Contractor (6 Months)', maxVehicles: 0, price: 11000, durationMonths: 6, category: 'CONSUMER' },
  { id: 'con-1y', name: 'Contractor (1 Year)', maxVehicles: 0, price: 20000, durationMonths: 12, category: 'CONSUMER' },

  // Cars & Vans
  { id: 'cv-5-3m', name: 'Cars Basic (3 Months)', maxVehicles: 5, price: 4000, durationMonths: 3, category: 'CARS_VANS' },
  { id: 'cv-15-3m', name: 'Cars Pro (3 Months)', maxVehicles: 15, price: 7000, durationMonths: 3, category: 'CARS_VANS' },
  { id: 'cv-unl-3m', name: 'Cars Enterprise (3 Months)', maxVehicles: 9999, price: 12000, durationMonths: 3, category: 'CARS_VANS' }
];

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
 try {
 const snapshot = await getDocs(collection(db, PLANS_COLLECTION));

 if (snapshot.empty) {
 return DEFAULT_PLANS;
 }

 return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPlan));
 } catch (error) {
 console.error('Error fetching plans:', error);
 return DEFAULT_PLANS;
 }
};

/**
 * Get all subscriptions (Admin only)
 */
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
 try {
 const snapshot = await getDocs(collection(db, SUBSCRIPTIONS_COLLECTION));
 return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
 } catch (error) {
 console.error('Error fetching all subscriptions:', error);
 throw error;
 }
};

/**
 * Get subscription for an agent
 */
export const getSubscription = async (agentId: string): Promise<Subscription | null> => {
 try {
 const q = query(
 collection(db, SUBSCRIPTIONS_COLLECTION),
 where('agentId', '==', agentId)
 );
 const snapshot = await getDocs(q);

 if (snapshot.empty) return null;

 // Sort in memory to avoid requiring a composite index
 const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
 docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

 return docs[0];
 } catch (error) {
 console.error('Error fetching subscription:', error);
 throw error;
 }
};

/**
 * Create subscription for agent
 */
export const createSubscription = async (
 agentId: string,
 agentName: string,
 agentEmail: string,
 planId: string
): Promise<Subscription> => {
 try {
 const plans = await getSubscriptionPlans();
 const plan = plans.find(p => p.id === planId);

 if (!plan) {
 throw new Error('Invalid plan selected');
 }

 const docRef = doc(collection(db, SUBSCRIPTIONS_COLLECTION));
 const now = new Date();
 const periodEnd = new Date(now);
 periodEnd.setMonth(periodEnd.getMonth() + plan.durationMonths);

 const subscriptionData: Omit<Subscription, 'id'> = {
 agentId,
 agentName,
 agentEmail,
 planId,
 planName: plan.name,
 status: 'pending', // Default to pending for admin approval
 maxVehicles: plan.maxVehicles,
 activeListingCount: 0,
 currentPeriodStart: now.toISOString(),
 currentPeriodEnd: periodEnd.toISOString(),
 createdAt: now.toISOString(),
 updatedAt: now.toISOString(),
 };

 await setDoc(docRef, subscriptionData);

 return { id: docRef.id, ...subscriptionData };
 } catch (error) {
 console.error('Error creating subscription:', error);
 throw error;
 }
};

/**
 * Update subscription status
 */
export const updateSubscriptionStatus = async (
 id: string,
 status: SubscriptionStatus
): Promise<void> => {
 try {
 const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);

 await updateDoc(docRef, {
 status,
 updatedAt: new Date().toISOString(),
 });
 } catch (error) {
 console.error('Error updating subscription status:', error);
 throw error;
 }
};

/**
 * Check if agent can publish a new listing
 */
export const canPublishListing = async (agentId: string): Promise<{
 allowed: boolean;
 reason?: string;
 currentCount: number;
 maxAllowed: number;
}> => {
 try {
 const subscription = await getSubscription(agentId);

 if (!subscription) {
 return {
 allowed: false,
 reason: 'No active subscription',
 currentCount: 0,
 maxAllowed: 0
 };
 }

 if (subscription.status !== 'active' && subscription.status !== 'trial') {
 return {
 allowed: false,
 reason: `Subscription is ${subscription.status}`,
 currentCount: 0,
 maxAllowed: subscription.maxVehicles
 };
 }

 const activeCount = await countActiveListings(agentId);

 if (activeCount >= subscription.maxVehicles) {
 return {
 allowed: false,
 reason: `Listing limit reached (${activeCount}/${subscription.maxVehicles})`,
 currentCount: activeCount,
 maxAllowed: subscription.maxVehicles
 };
 }

 return {
 allowed: true,
 currentCount: activeCount,
 maxAllowed: subscription.maxVehicles
 };
 } catch (error) {
 console.error('Error checking publish permission:', error);
 throw error;
 }
};

/**
 * Get subscription usage stats
 */
export const getSubscriptionUsage = async (agentId: string): Promise<{
 subscription: Subscription | null;
 activeListings: number;
 percentUsed: number;
 daysRemaining: number;
}> => {
 try {
 const subscription = await getSubscription(agentId);

 if (!subscription) {
 return {
 subscription: null,
 activeListings: 0,
 percentUsed: 0,
 daysRemaining: 0,
 };
 }

 const activeListings = await countActiveListings(agentId);
 const percentUsed = Math.round((activeListings / subscription.maxVehicles) * 100);

 const periodEnd = new Date(subscription.currentPeriodEnd);
 const now = new Date();
 const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

 return {
 subscription,
 activeListings,
 percentUsed,
 daysRemaining,
 };
 } catch (error) {
 console.error('Error getting subscription usage:', error);
 return {
 subscription: null,
 activeListings: 0,
 percentUsed: 0,
 daysRemaining: 0,
 };
 }
};
