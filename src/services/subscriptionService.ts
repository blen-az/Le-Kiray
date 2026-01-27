import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../types';
import { countActiveListings } from './listingService';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PLANS_COLLECTION = 'subscriptionPlans';

// Default plans if none exist in Firestore
const DEFAULT_PLANS: SubscriptionPlan[] = [
    { id: 'cv-1', name: 'Standard (Car)', maxVehicles: 10, monthlyFee: 1000, category: 'CARS_VANS' },
    { id: 'cv-2', name: 'Growth (Car)', maxVehicles: 25, monthlyFee: 2500, category: 'CARS_VANS' },
    { id: 'em-1', name: 'Heavy Basic', maxVehicles: 5, monthlyFee: 5000, category: 'EARTH_MOVING' },
    { id: 'em-2', name: 'Heavy Pro', maxVehicles: 15, monthlyFee: 10000, category: 'EARTH_MOVING' },
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

        const docData = snapshot.docs[0];
        return { id: docData.id, ...docData.data() } as Subscription;
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
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const subscriptionData: Omit<Subscription, 'id'> = {
            agentId,
            planId,
            planName: plan.name,
            status: 'active',
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
        throw error;
    }
};
