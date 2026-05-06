
import React from 'react';
import { Listing, VehicleCategory, isQuoteCategory } from '../../../types';

interface VehicleCardProps {
 vehicle: Listing;
 onSelect: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
 const isHeavy = isQuoteCategory(vehicle.category);

 return (
  <div className="bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-indigo-500/30 transition-all hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] group flex flex-col h-full active:scale-[0.98]">
  <div className="relative h-64 overflow-hidden p-3">
  <div className="w-full h-full rounded-[32px] overflow-hidden relative">
  <img 
  src={vehicle.imageUrls[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
  alt={`${vehicle.make} ${vehicle.model}`}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>
  </div>
  
  <div className="absolute top-8 left-8">
  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-xl shadow-2xl ${
  isHeavy 
  ? 'bg-amber-600/20 text-amber-100 border-amber-600/30' 
  : 'bg-indigo-600/20 text-white border-indigo-600/30'
  }`}>
  {vehicle.category.replace('_', ' ')}
  </span>
  </div>
  
  {!isHeavy && (
  <div className="absolute bottom-8 right-8">
  <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-2xl">
  <span className="text-xl font-black text-slate-900 tracking-tighter">{vehicle.dailyRate?.toLocaleString()}</span>
  <span className="text-[10px] text-slate-400 font-black ml-2 uppercase tracking-widest">ETB/D</span>
  </div>
  </div>
  )}
  </div>
 
  <div className="px-8 pb-8 pt-4 flex-1 flex flex-col">
  <div className="mb-6">
  <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{vehicle.make} {vehicle.model}</h3>
  <div className="flex items-center gap-3 mt-2">
  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{vehicle.location}</span>
  </div>
  <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50/50 rounded-full border border-indigo-100/30">
  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
  <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest">Available</span>
  </div>
  </div>
  </div>
 
  <div className="flex flex-wrap gap-2 mb-8">
  {vehicle.specifications.slice(0, 3).map((spec, i) => (
  <span key={i} className="text-[9px] px-4 py-2 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest border border-slate-100/50 group-hover:border-indigo-100 transition-colors">
  {spec}
  </span>
  ))}
  </div>
 
  <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-50">
  <div className="flex items-center gap-3">
  <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs border border-slate-100 group-hover:bg-white group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
  {vehicle.agentName.substring(0,1).toUpperCase()}
  </div>
  <div className="flex flex-col">
  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Owner</span>
  <span className="text-xs text-slate-900 font-black tracking-tight leading-none">{vehicle.agentName}</span>
  </div>
  </div>
  <button 
  onClick={(e) => { e.stopPropagation(); onSelect(); }}
  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${
  isHeavy 
  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' 
  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
  }`}
  >
  Book Now
  </button>
  </div>
  </div>
  </div>
 );
};

export default VehicleCard;
