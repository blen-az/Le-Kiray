
import React from 'react';
import { Listing, VehicleCategory, isQuoteCategory } from '../../../types';

interface VehicleCardProps {
  vehicle: Listing;
  onSelect: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
  const isHeavy = isQuoteCategory(vehicle.category);

  return (
    <div className="bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group flex flex-col">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={vehicle.imageUrls[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
        <div className="absolute top-5 left-5">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            isHeavy 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
          }`}>
            {vehicle.category.replace('_', ' ')}
          </span>
        </div>
        {!isHeavy && (
          <div className="absolute bottom-5 right-5">
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700">
              <span className="text-lg font-black text-white">{vehicle.dailyRate?.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">ETB/D</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{vehicle.make} {vehicle.model}</h3>
          <div className="flex items-center gap-2 mt-1">
             <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
             <span className="text-xs text-slate-500 font-medium">{vehicle.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {vehicle.specifications.slice(0, 3).map((spec, i) => (
            <span key={i} className="text-[10px] px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl font-bold uppercase tracking-wider">
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-[10px] font-black text-slate-400">
               {vehicle.agentName.substring(0,2).toUpperCase()}
            </div>
            <span className="text-xs text-slate-400 font-bold tracking-tight">{vehicle.agentName}</span>
          </div>
          <button 
            onClick={onSelect}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              isHeavy 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-900/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/20'
            }`}
          >
            {isHeavy ? 'Get Quote' : 'Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
