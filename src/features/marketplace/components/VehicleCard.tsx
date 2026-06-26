import React, { useState } from 'react';
import { Listing, VehicleCategory } from '../../../types';

interface VehicleCardProps {
  vehicle: Listing;
  onSelect: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Fallback price generation for heavy machinery
  const getFallbackRates = (cat: VehicleCategory) => {
    switch (cat) {
      case VehicleCategory.EXCAVATOR:
        return { daily: 25000, hourly: 3200 };
      case VehicleCategory.DOZER:
        return { daily: 35000, hourly: 4500 };
      case VehicleCategory.LOADER:
        return { daily: 18000, hourly: 2300 };
      case VehicleCategory.CRANE:
        return { daily: 45000, hourly: 5800 };
      case VehicleCategory.DUMP_TRUCK:
        return { daily: 12000, hourly: 1500 };
      case VehicleCategory.COMPACTOR:
        return { daily: 10000, hourly: 1250 };
      default:
        return { daily: 15000, hourly: 1800 };
    }
  };

  const rates = vehicle.dailyRate 
    ? { daily: vehicle.dailyRate, hourly: Math.round(vehicle.dailyRate / 8) }
    : getFallbackRates(vehicle.category);

  // Mock ratings for luxury listing depth
  const ratingValue = 4.9;
  const reviewCount = 18;

  return (
    <div 
      onClick={onSelect}
      className="group relative flex flex-col h-[460px] bg-white rounded-[28px] border border-slate-100 hover:border-brand-main/20 shadow-dribbble hover:shadow-[0_24px_48px_rgba(53,92,255,0.06)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden font-sans"
    >
      {/* 65% HD image container */}
      <div className="relative h-[65%] w-full overflow-hidden bg-slate-50">
        <img 
          src={vehicle.imageUrls[0] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800'} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/20 bg-white/95 text-slate-800 backdrop-blur-md shadow-sm">
            {vehicle.category.replace('_', ' ')}
          </span>
        </div>

        {/* Favorite heart icon */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-sm border border-slate-200/30 z-10 cursor-pointer"
        >
          <svg 
            className={`w-4.5 h-4.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} 
            fill={isFavorite ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Availability Pill Overlay */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 text-white rounded-xl text-[8px] font-black uppercase tracking-wider backdrop-blur-md border border-emerald-400/20">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Available Now
          </span>
        </div>
      </div>

      {/* Details container (35%) */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Supplier Profile Row */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5.5 h-5.5 rounded-lg bg-slate-50 border border-slate-250/50 flex items-center justify-center text-[9px] font-black text-slate-700 shrink-0">
                {vehicle.agentName ? vehicle.agentName[0].toUpperCase() : 'A'}
              </div>
              <span className="text-[10px] text-slate-500 font-extrabold truncate max-w-[100px]">{vehicle.agentName || 'Verified Agent'}</span>
              <svg className="w-3.5 h-3.5 text-brand-main shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
              </svg>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0 font-extrabold">
              <span className="text-amber-500">★</span>
              <span className="text-slate-800">{ratingValue}</span>
              <span className="text-slate-400 font-medium">({reviewCount})</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-brand-main transition-colors duration-200 truncate">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="text-[8px] text-slate-450 font-black uppercase tracking-wider bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded-md shrink-0">
              {vehicle.year}
            </span>
          </div>

          {/* Location details */}
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
            <svg className="w-3 h-3 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="truncate">{vehicle.location}</span>
          </div>

          {/* Technical CAD Specification Overlay */}
          {vehicle.specifications && vehicle.specifications.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
              {vehicle.specifications.slice(0, 2).map((spec, i) => {
                const parts = spec.split(':');
                const label = parts[0]?.trim() || 'Spec';
                const value = parts[1]?.trim() || spec;
                return (
                  <div key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-lg flex items-center gap-1.5 shrink-0">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">{label}</span>
                    <span className="text-[10px] font-black text-slate-800">{value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing & Mobilize CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-0.5">
              <span className="text-md font-black text-slate-900 tracking-tight">
                {rates.daily.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">ETB/day</span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 mt-0.5">
              {rates.hourly.toLocaleString()} ETB/hr
            </span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="px-4 py-2.5 bg-brand-main hover:bg-brand-main/95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md shadow-brand-main/15 flex items-center gap-1 cursor-pointer"
          >
            Deploy Unit
            <svg className="w-3 h-3 text-white transition-transform group-hover:translate-x-0.5 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
