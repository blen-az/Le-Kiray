import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PremiumHeroProps {
  userName?: string;
}

const PremiumHero: React.FC<PremiumHeroProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(search)}`);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: 'url("/images/hero_bg.png"), linear-gradient(to bottom, #0f172a, #1e293b)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-6 flex flex-col justify-center">
        <div className="max-w-3xl animate-slide-up">
          {userName && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Welcome back, {userName}</span>
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Industrial Rental
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
            Discover verified heavy machinery and premium vehicles. 
            Streamlined for agents, built for projects.
          </p>

          {/* Search Bar - Glassmorphism */}
          <form 
            onSubmit={handleSearch}
            className="group relative flex items-center p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl shadow-black/40 max-w-2xl transition-all hover:bg-white/15 hover:border-white/30"
          >
            <div className="flex-1 flex items-center px-6">
              <svg className="w-6 h-6 text-amber-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Search for excavators, SUVs, or locations..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400 font-medium py-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-[24px] transition-all active:scale-95 shadow-lg shadow-amber-500/20"
            >
              Search
            </button>
          </form>

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">1.2k+</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Fleet</span>
            </div>
            <div className="w-px h-10 bg-white/10 self-center hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">450+</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Verified Agents</span>
            </div>
            <div className="w-px h-10 bg-white/10 self-center hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">24/7</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Support Lead</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumHero;
