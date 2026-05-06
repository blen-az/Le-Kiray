
import React from 'react';
import { VehicleCategory } from '../../../types';

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
    { label: 'All Equipment', value: 'ALL' },
    { label: 'Excavators', value: VehicleCategory.EXCAVATOR },
    { label: 'Dozers', value: VehicleCategory.DOZER },
    { label: 'Loaders', value: VehicleCategory.LOADER },
    { label: 'Cranes', value: VehicleCategory.CRANE },
    { label: 'Dump Trucks', value: VehicleCategory.DUMP_TRUCK },
    { label: 'Compactors', value: VehicleCategory.COMPACTOR },
    { label: 'Other', value: VehicleCategory.OTHER_MACHINERY },
  ];

 return (
 <div className="space-y-12">
 <div>
 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">Global Search</h3>
 <div className="relative group">
 <input 
 type="text" 
 placeholder="FIND MACHINERY..."
 value={searchQuery}
 onChange={(e) => onSearchChange(e.target.value)}
 className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all text-sm text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest shadow-inner"
 />
 <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">Classification</h3>
 <div className="grid gap-3 grid-cols-1">
 {categories.map((cat) => (
 <button
 key={cat.label}
 onClick={() => onCategoryChange(cat.value as any)}
 className={`text-left px-6 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
 activeCategory === cat.value 
 ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-2' 
 : 'bg-white border-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-900'
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
