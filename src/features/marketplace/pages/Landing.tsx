
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
          The Unified Fleet Platform
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
          Rent Any Vehicle.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">Request Any Machine.</span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-400 mb-12">
          Le'Kiray bridges the gap between everyday car rentals and heavy-duty construction equipment. One dashboard, two distinct worlds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/marketplace')}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1"
          >
            Browse Marketplace
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all hover:-translate-y-1"
          >
            List Your Fleet
          </button>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Booking</h3>
            <p className="text-slate-400 text-sm">Cars, vans, and SUVs available for immediate pick-up with transparent daily rates.</p>
          </div>
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quote-Based Heavy</h3>
            <p className="text-slate-400 text-sm">Excavators and dozers with project-specific pricing. We handle the leads, you build the site.</p>
          </div>
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Zero Commission</h3>
            <p className="text-slate-400 text-sm">Software-first approach. Agents pay a flat subscription. Keep 100% of your rental revenue.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
