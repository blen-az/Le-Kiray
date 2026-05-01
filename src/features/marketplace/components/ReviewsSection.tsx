import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
 collection, query, where, orderBy, getDocs,
 addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Review } from '../../../types';
import { useAuth } from '../../auth/context/AuthContext';

interface ReviewsSectionProps {
 listingId: string;
}

const fetchReviews = async (listingId: string): Promise<Review[]> => {
 const q = query(
 collection(db, 'reviews'),
 where('listingId', '==', listingId),
 orderBy('createdAt', 'desc')
 );
 const snap = await getDocs(q);
 return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
};

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({
 value,
 onChange,
 readonly = false,
}) => {
 const [hovered, setHovered] = useState(0);
 return (
 <div className="flex gap-1">
 {[1, 2, 3, 4, 5].map(star => (
 <button
 key={star}
 type="button"
 disabled={readonly}
 onClick={() => onChange?.(star)}
 onMouseEnter={() => !readonly && setHovered(star)}
 onMouseLeave={() => setHovered(0)}
 className={`text-2xl transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
 >
 <span className={star <= (hovered || value) ? 'text-amber-400' : 'text-slate-700'}>★</span>
 </button>
 ))}
 </div>
 );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
 <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-black text-sm uppercase">
 {review.consumerName.charAt(0)}
 </div>
 <div>
 <p className="text-white font-bold text-sm">{review.consumerName}</p>
 <p className="text-slate-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
 </div>
 </div>
 <StarRating value={review.rating} readonly />
 </div>
 <p className="text-slate-400 text-sm leading-relaxed">{review.comment}</p>
 </div>
);

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ listingId }) => {
 const { currentUser } = useAuth();
 const queryClient = useQueryClient();

 const { data: reviews = [], isLoading } = useQuery({
 queryKey: ['reviews', listingId],
 queryFn: () => fetchReviews(listingId),
 });

 const [rating, setRating] = useState(0);
 const [comment, setComment] = useState('');
 const [submitError, setSubmitError] = useState<string | null>(null);

 const avgRating = reviews.length > 0
 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
 : 0;

 const mutation = useMutation({
 mutationFn: async () => {
 if (!currentUser) throw new Error('You must be logged in to leave a review.');
 if (rating === 0) throw new Error('Please select a star rating.');
 if (!comment.trim()) throw new Error('Please write a comment.');

 await addDoc(collection(db, 'reviews'), {
 listingId,
 consumerId: currentUser.id,
 consumerName: currentUser.name || 'Anonymous',
 rating,
 comment: comment.trim(),
 createdAt: new Date().toISOString(),
 });
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['reviews', listingId] });
 setRating(0);
 setComment('');
 setSubmitError(null);
 },
 onError: (err: any) => {
 setSubmitError(err.message || 'Failed to submit review.');
 },
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setSubmitError(null);
 mutation.mutate();
 };

 return (
 <div className="space-y-8">
 {/* Average Rating Header */}
 <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
 <div className="text-center">
 <div className="text-5xl font-black text-white">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
 <div className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">out of 5</div>
 </div>
 <div>
 <StarRating value={Math.round(avgRating)} readonly />
 <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-2">
 {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
 </p>
 </div>
 </div>

 {/* Write a Review */}
 {currentUser && (
 <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
 <h4 className="text-sm font-black text-white uppercase tracking-widest">Write a Review</h4>
 
 <div>
 <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Your Rating</label>
 <StarRating value={rating} onChange={setRating} />
 </div>

 <div>
 <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Your Comment</label>
 <textarea
 value={comment}
 onChange={e => setComment(e.target.value)}
 rows={3}
 placeholder="Share your experience..."
 className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder-slate-600"
 />
 </div>

 {submitError && (
 <p className="text-red-400 text-xs font-bold">{submitError}</p>
 )}

 <button
 type="submit"
 disabled={mutation.isPending}
 className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {mutation.isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
 {mutation.isPending ? 'Submitting…' : 'Submit Review'}
 </button>
 </form>
 )}

 {/* Reviews List */}
 {isLoading ? (
 <div className="flex justify-center py-8">
 <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 ) : reviews.length === 0 ? (
 <p className="text-slate-500 text-sm text-center py-8">No reviews yet. Be the first!</p>
 ) : (
 <div className="space-y-4">
 {reviews.map(review => (
 <ReviewCard key={review.id} review={review} />
 ))}
 </div>
 )}
 </div>
 );
};
