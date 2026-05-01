import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Listing } from '../../../types';
import { getListing } from '../../../services/listingService';
import BookingFlow from '../../booking/components/BookingFlow';

const VehicleDetailPage: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const [vehicle, setVehicle] = useState<Listing | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const fetchVehicle = async () => {
 if (!id) return;
 try {
 const data = await getListing(id);
 if (data) {
 setVehicle(data);
 } else {
 setError('Vehicle not found');
 }
 } catch (err) {
 console.error('Error fetching vehicle:', err);
 setError('Failed to load vehicle details');
 } finally {
 setLoading(false);
 }
 };

 fetchVehicle();
 }, [id]);

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 if (error || !vehicle) {
 return (
 <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-3xl border border-slate-200 text-center">
 <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
 </div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">{error || 'Something went wrong'}</h2>
 <p className="text-slate-500 text-sm mb-8">We couldn't find the vehicle you're looking for.</p>
 <button 
 onClick={() => navigate('/marketplace')}
 className="px-8 py-3 bg-brand-main text-white font-bold rounded-2xl shadow-xl shadow-brand-main/20 transition-all hover:-translate-y-1 active:scale-95"
 >
 Back to Marketplace
 </button>
 </div>
 );
 }

 return (
 <div className="animate-fade-in px-4 py-8 md:py-12">
 <BookingFlow 
 vehicle={vehicle} 
 onBack={() => navigate(-1)} 
 />
 </div>
 );
};

export default VehicleDetailPage;
