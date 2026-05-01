import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

// Initialize Stripe with your secret key (set via environment variables or Firebase Secrets)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-11-20.acacia" as any,
});
export const assignRoleOnCreate = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const role = data.role || 'CONSUMER';
        const isApproved = data.isApproved || (role === 'CONSUMER');

        try {
            await admin.auth().setCustomUserClaims(context.params.userId, { role, isApproved });
            console.log(`Successfully assigned role ${role} (Approved: ${isApproved}) to user ${context.params.userId}`);
        } catch (error) {
            console.error('Error assigning custom claims:', error);
        }
    });

// 2. Assign Role Custom Claim on User Update
export const assignRoleOnUpdate = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        if (before.role !== after.role || before.isApproved !== after.isApproved) {
            try {
                const role = after.role || 'CONSUMER';
                const isApproved = after.isApproved || (role === 'CONSUMER');
                await admin.auth().setCustomUserClaims(context.params.userId, { role, isApproved });
                console.log(`Successfully updated claims for user ${context.params.userId}: role=${role}, isApproved=${isApproved}`);
            } catch (error) {
                console.error('Error assigning custom claims:', error);
            }
        }
    });

// 3. Atomically check for date overlaps and create booking
export const confirmBooking = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { listingId, startDate, endDate, totalPrice } = data;
    if (!listingId || !startDate || !endDate) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    const db = admin.firestore();
    const listingRef = db.collection('listings').doc(listingId);

    try {
        const result = await db.runTransaction(async (transaction) => {
            const listingDoc = await transaction.get(listingRef);
            if (!listingDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Listing not found.');
            }
            const listingData = listingDoc.data();

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Check current active bookings
            const bookingsQuery = db.collection('bookings')
                .where('listingId', '==', listingId)
                .where('status', 'in', ['pending', 'confirmed', 'in_progress']);

            const existingBookings = await transaction.get(bookingsQuery);

            let conflict = false;
            existingBookings.forEach((doc) => {
                const b = doc.data();
                const bStart = b.startDate instanceof admin.firestore.Timestamp ? b.startDate.toDate() : new Date(b.startDate);
                const bEnd = b.endDate instanceof admin.firestore.Timestamp ? b.endDate.toDate() : new Date(b.endDate);
                if (start <= bEnd && end >= bStart) {
                    conflict = true;
                }
            });

            if (conflict) {
                throw new functions.https.HttpsError('already-exists', 'Dates are already booked.');
            }

            // Safe to book
            const bookingRef = db.collection('bookings').doc();
            const bookingData = {
                id: bookingRef.id,
                listingId,
                listingName: `${listingData?.make} ${listingData?.model}`,
                agentId: listingData?.agentId,
                consumerId: context.auth!.uid,
                // Since custom claims don't natively store email/name unless we inject them, fallback to token or request fields
                consumerName: data.consumerName || 'Consumer',
                consumerEmail: data.consumerEmail || '',
                startDate: admin.firestore.Timestamp.fromDate(start),
                endDate: admin.firestore.Timestamp.fromDate(end),
                totalPrice,
                status: 'pending',
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            };

            transaction.set(bookingRef, bookingData);
            return bookingData;
        });

        return { success: true, booking: result };
    } catch (error: any) {
        console.error('Transaction failure:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Cloud Function to create a Stripe PaymentIntent securely
 * Triggered via callable function from the frontend
 */
export const createPaymentIntent = functions.https.onCall(
    async (data, context) => {
        // 1. Authenticate user
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User must be logged in to create a payment intent."
            );
        }

        const amount = data.amount;

        // 2. Validate parameters
        if (!amount || typeof amount !== "number" || amount <= 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "A valid amount is required."
            );
        }

        try {
            // 3. Create the PaymentIntent with Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects amount in cents/smallest currency unit
                currency: "etb",                  // Ethiopian Birr
                metadata: {
                    userId: context.auth.uid,
                    listingId: data.listingId || "unknown",
                },
            });

            // 4. Return the client secret to the frontend
            return {
                clientSecret: paymentIntent.client_secret,
            };
        } catch (error: any) {
            console.error("Error creating PaymentIntent:", error);
            throw new functions.https.HttpsError(
                "internal",
                error.message || "Failed to create payment intent."
            );
        }
    }
);
