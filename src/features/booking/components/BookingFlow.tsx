
import React, { useState } from 'react';
import { Listing, VehicleCategory, isQuoteCategory } from '../../../types';

interface BookingFlowProps {
  vehicle: Listing;
  onBack: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ vehicle, onBack }) => {
  const isHeavy = isQuoteCategory(vehicle.category);
  const [success, setSuccess] = useState(false);

  // Form states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projectDetails, setProjectDetails] = useState({ location: '', scope: '', duration: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 rotate-3">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-4xl font-black text-white mb-6">
          {isHeavy ? 'Project Received' : 'Ready to Roll!'}
        </h2>
        <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto">
          {isHeavy 
            ? `Your quote request for the ${vehicle.make} ${vehicle.model} has been securely transmitted to ${vehicle.agentName}. Expect a call shortly.`
            : `Booking confirmed for your ${vehicle.make} ${vehicle.model}. We've sent the details to your email.`
          }
        </p>
        <button 
          onClick={onBack}
          className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-white font-bold mb-12 group">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-slate-600 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </div>
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <div className="relative rounded-[40px] overflow-hidden border border-slate-800 aspect-video shadow-2xl">
            <img src={vehicle.imageUrls[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} alt={vehicle.model} className="w-full h-full object-cover" />
            <div className="absolute top-8 left-8">
               <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border backdrop-blur-md ${
                  isHeavy ? 'bg-amber-600/20 text-amber-400 border-amber-600/30' : 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30'
               }`}>
                  {vehicle.category}
               </span>
            </div>
          </div>
          <div className="mt-12">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">{vehicle.make} {vehicle.model}</h1>
            <div className="flex items-center gap-6 text-slate-500 mb-10 font-bold uppercase tracking-widest text-xs">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> {vehicle.year}</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> {vehicle.location}</span>
              <span className="flex items-center gap-2 text-indigo-400"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> VERIFIED AGENT</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-800 pt-10">
               <div>
                  <h3 className="font-black text-white text-sm uppercase tracking-widest mb-6">Specifications</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {vehicle.specifications.map((spec, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-400 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
                        <div className={`w-2 h-2 rounded-full ${isHeavy ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                        <span className="text-sm font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
               </div>
               <div>
                  <h3 className="font-black text-white text-sm uppercase tracking-widest mb-6">Description</h3>
                  <p className="text-slate-400 leading-relaxed text-base">
                    {vehicle.description}
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 sticky top-28 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -z-10 ${isHeavy ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`}></div>
            
            {isHeavy ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="mb-2">
                  <h2 className="text-3xl font-black text-white mb-2">Request Quote</h2>
                  <p className="text-slate-500 text-sm font-medium">Custom project logistics required.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Project Site Location</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Street, City, Zone..."
                      className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      onChange={e => setProjectDetails({...projectDetails, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Duration Estimate</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., 45 Working Days"
                      className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      onChange={e => setProjectDetails({...projectDetails, duration: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Scope of Work</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Explain the excavation, grading, or moving tasks..."
                      className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                      onChange={e => setProjectDetails({...projectDetails, scope: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-amber-500/5 p-6 rounded-3xl border border-amber-500/10">
                  <div className="flex gap-4">
                     <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                     </div>
                     <p className="text-[10px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-wide">
                        Disclaimer: Le'Kiray provides lead generation only. All heavy equipment contracts are signed directly with {vehicle.agentName}.
                     </p>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-900/30 hover:-translate-y-1">
                  Transmit Request
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-white">Instant Book</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Daily rate secured.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-indigo-500 tracking-tighter">{vehicle.dailyRate?.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-widest">ETB / DAY</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Pick-up</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Return</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-8">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Rental Subtotal</span>
                      <span className="text-white">{vehicle.dailyRate?.toLocaleString()} ETB</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Platform Service</span>
                      <span className="text-emerald-500">FREE</span>
                   </div>
                   <div className="pt-4 flex justify-between items-center">
                      <span className="font-black text-white uppercase tracking-[0.2em] text-sm">Grand Total</span>
                      <span className="text-3xl font-black text-white tracking-tighter">{vehicle.dailyRate?.toLocaleString()} <span className="text-sm">ETB</span></span>
                   </div>
                </div>

                <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                  <div className="flex gap-4">
                     <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     </div>
                     <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide leading-relaxed">
                        Le'Kiray ensures availability. You will sign the official rental contract with {vehicle.agentName} during pick-up.
                     </p>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-900/30 hover:-translate-y-1">
                  Confirm Booking
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
