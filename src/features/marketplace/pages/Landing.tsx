import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { UserRole } from '../../../types';

import ConsumerHome from '../components/ConsumerHome';

const Landing: React.FC = () => {
 const navigate = useNavigate();
 const { currentUser } = useAuth();
 const isAgent = currentUser?.role === UserRole.AGENT;
 const isConsumer = currentUser?.role === UserRole.CONSUMER;

 if (isConsumer) {
 return <ConsumerHome />;
 }

 return (
 <div className="relative overflow-hidden">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
 <div className="max-w-[1440px] mx-auto px-6 py-16 md:py-32 flex flex-col items-center text-center">
 {currentUser && (
 <div className="mb-6 animate-fade-in">
 <h2 className="text-lg sm:text-xl font-bold text-brand-main">
 Welcome back, {currentUser.name.split(' ')[0]}!
 </h2>
 </div>
 )}
        <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8">
          The Industrial Equipment Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 sm:mb-8">
          Rent Heavy Machinery.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Build Your Project.</span>
        </h1>
        <p className="max-w-xl text-sm sm:text-base text-slate-600 mb-10 sm:mb-12 leading-relaxed">
          The ultimate marketplace for excavators, dozers, and site machinery. Connect with local fleet agents and get custom project quotes in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
          <button 
            onClick={() => navigate('/marketplace')}
            className="w-full sm:w-auto px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-900/20 transition-all hover:-translate-y-1 active:scale-95"
          >
            Browse Equipment
          </button>
          
          {isAgent ? (
            <button 
              onClick={() => navigate('/agent/dashboard')}
              className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all hover:-translate-y-1 active:scale-95"
            >
              Go to Dashboard
            </button>
          ) : (
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm transition-all hover:-translate-y-1 active:scale-95"
            >
              List Your Fleet
            </button>
          )}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-left">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Quote-Based Leads</h3>
            <p className="text-slate-600 text-sm">Get precise, project-specific pricing for excavators, cranes, and specialized site machinery directly from agents.</p>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-left">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Site Logistics</h3>
            <p className="text-slate-600 text-sm">We facilitate the connection. Coordinate delivery, pick-up, and operator requirements through our unified dashboard.</p>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-left">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Verified Agents</h3>
            <p className="text-slate-600 text-sm">Work with vetted industrial fleet operators. Our subscription model ensures high-quality leads and zero commissions.</p>
          </div>
        </div>
 </div>
 </div>
 );
};

export default Landing;
