
import React from 'react';
import { VehicleCategory } from '../types';

interface VehicleFiltersProps {
  activeCategory: VehicleCategory | 'ALL';
  onCategoryChange: (cat: VehicleCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({ 
  activeCategory, 
  onCategoryChange,
  searchQuery,
  onSearchChange
}) => {
  const categories = [
    { label: 'All Fleet', value: 'ALL' },
    { label: 'Compact', value: VehicleCategory.COMPACT },
    { label: 'Mid-Size', value: VehicleCategory.MID_SIZE },
    { label: 'Family SUVs', value: VehicleCategory.FAMILY },
    { label: 'Vans', value: VehicleCategory.VAN },
    { label: 'Heavy Equipment', value: VehicleCategory.EARTH_MOVING },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Search</h3>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search make or model..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm text-white placeholder-slate-600"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Categories</h3>
        <div className="grid gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value as any)}
              className={`text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                activeCategory === cat.value 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] text-white relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <h4 className="font-black text-lg mb-2">Fleet Support</h4>
          <p className="text-xs text-indigo-100 leading-relaxed mb-6 font-medium">
            Confused about excavation needs? Let our AI analyze your site scope.
          </p>
          <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
            Ask AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
