import React, { useState } from 'react';
import { VehicleCategory } from '../../../types';

interface VehicleFiltersProps {
  activeCategory: VehicleCategory | 'ALL';
  onCategoryChange: (cat: VehicleCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locationFilter: string;
  onLocationChange: (loc: string) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  onlyAvailable: boolean;
  onAvailabilityChange: (avail: boolean) => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationChange,
  maxPrice,
  onPriceChange,
  onlyAvailable,
  onAvailabilityChange
}) => {
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  const categories = [
    { label: 'All Equipment', value: 'ALL', icon: '🏗️' },
    { label: 'Excavators', value: VehicleCategory.EXCAVATOR, icon: '🚜' },
    { label: 'Dozers', value: VehicleCategory.DOZER, icon: '🚧' },
    { label: 'Loaders', value: VehicleCategory.LOADER, icon: '🚚' },
    { label: 'Cranes', value: VehicleCategory.CRANE, icon: '🏗️' },
    { label: 'Dump Trucks', value: VehicleCategory.DUMP_TRUCK, icon: '🚛' },
    { label: 'Compactors', value: VehicleCategory.COMPACTOR, icon: '🎛️' },
    { label: 'Other', value: VehicleCategory.OTHER_MACHINERY, icon: '🛠️' },
  ];

  const locations = [
    { label: 'All Locations', value: 'ALL' },
    { label: 'Addis Ababa', value: 'Addis Ababa' },
    { label: 'Adama', value: 'Adama' },
    { label: 'Bahir Dar', value: 'Bahir Dar' },
    { label: 'Gondar', value: 'Gondar' },
    { label: 'Dessie', value: 'Dessie' }
  ];

  return (
    <div className="w-full bg-white border border-slate-150 rounded-2xl p-5 shadow-dribbble space-y-5 animate-fade-in relative z-20">
      {/* Search Input and Category Selection */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
        {/* Global Search */}
        <div className="relative flex-1 group">
          <input 
            type="text" 
            placeholder="Search make, model, or specs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white outline-none transition-all text-xs font-black text-slate-900 placeholder:text-slate-450"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-main transition-colors">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        {/* Category Chips Container - Horizontal Scrolling */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none max-w-full xl:max-w-[70%]">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => onCategoryChange(cat.value as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                activeCategory === cat.value 
                  ? 'bg-brand-main text-white border-brand-main shadow-sm shadow-brand-main/20' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filters Toggle Button */}
        <button 
          onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
            showAdvanceFilters || locationFilter !== 'ALL' || maxPrice < 100000 || onlyAvailable
              ? 'bg-brand-main/5 text-brand-main border-brand-main/30'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
          {(locationFilter !== 'ALL' || maxPrice < 100000 || onlyAvailable) && (
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          )}
        </button>
      </div>

      {/* Advanced Quick Filters Collapsible Bar */}
      {showAdvanceFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5 border-t border-slate-150 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Location Selector */}
          <div className="space-y-1.5">
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Project Location</label>
            <div className="relative">
              <select 
                value={locationFilter}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all cursor-pointer appearance-none"
              >
                {locations.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Max Daily Rate</label>
              <span className="text-xs font-black text-slate-900">{maxPrice.toLocaleString()} ETB</span>
            </div>
            <div className="pt-2">
              <input 
                type="range" 
                min="5000" 
                max="100000" 
                step="5000"
                value={maxPrice} 
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg cursor-pointer transition-all accent-brand-main"
              />
            </div>
          </div>

          {/* Quick Rating Selector */}
          <div className="space-y-1.5">
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Trust Index (Rating)</label>
            <div className="flex gap-2">
              {[4.0, 4.5, 4.8].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-all text-center"
                >
                  {rate}+ ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Immediate Availability Toggle */}
          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-xl p-4.5">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-800">Only Available Now</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Exclude Active Contracts</span>
            </div>
            <button 
              type="button"
              onClick={() => onAvailabilityChange(!onlyAvailable)}
              className={`w-10 h-6 rounded-full p-0.5 transition-all duration-300 ${
                onlyAvailable ? 'bg-brand-main' : 'bg-slate-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                onlyAvailable ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFilters;
