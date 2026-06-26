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
    triggerSearch(search);
  };

  const triggerSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/marketplace');
    }
  };

  const popularShortcuts = [
    { label: 'Excavators', query: 'excavator' },
    { label: 'Dump Trucks', query: 'dump truck' },
    { label: 'Loader Spec Sheets', query: 'loader' },
    { label: 'Cranes', query: 'crane' }
  ];

  return (
    <div className="relative min-h-[90vh] w-full overflow-hidden bg-slate-50 flex items-center justify-center py-12 md:py-24">
      {/* Light Blueprint background */}
      <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/40 pointer-events-none" />

      {/* Soft ambient glows */}
      <div className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] bg-brand-main/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute -bottom-[15%] -right-[5%] w-[45%] h-[45%] bg-brand-accent/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-main/50 via-brand-accent/50 to-brand-main/50" />

      <div className="relative w-full px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
        {/* Left Column - Hero Text & Search */}
        <div className="lg:col-span-7 flex flex-col justify-center animate-slide-up">
          {userName ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-main/5 border border-brand-main/15 mb-8 self-start shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-brand-main text-xs font-black uppercase tracking-wider">Operational Mode: Active Agent ({userName})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-main/5 border border-brand-main/15 mb-8 self-start shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-main animate-pulse" />
              <span className="text-brand-main text-xs font-black uppercase tracking-wider">Enterprise Heavy Machinery Hub</span>
            </div>
          )}

          <h1 className="text-5xl md:text-[68px] font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
            The Fleet Control <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-main via-indigo-500 to-brand-accent">
              For Heavy Projects
            </span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg mb-8 max-w-xl leading-relaxed font-medium">
            Instantly deploy fully-certified heavy equipment and technical machinery. Re-engineered workflow tracking, high-fidelity specs sheets, and enterprise logistics control.
          </p>

          {/* Search container */}
          <div className="w-full max-w-xl">
            <form
              onSubmit={handleSearch}
              className="relative group flex items-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-dribbble hover:border-brand-main/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-1 flex items-center px-4">
                <svg className="w-5 h-5 text-brand-accent mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search machinery, models, or locations..."
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 font-bold py-3.5 outline-none text-sm tracking-wide"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-main hover:bg-brand-main/90 text-white font-black rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-brand-main/20 text-xs uppercase tracking-wider"
              >
                Search
              </button>
            </form>

            {/* Machinery Category Shortcuts */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Quick Select:</span>
              {popularShortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  onClick={() => {
                    setSearch(shortcut.label);
                    triggerSearch(shortcut.query);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:border-brand-main/30 transition-all"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">ETB 240M+</span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider mt-1.5">Asset Value Deployed</span>
            </div>
            <div className="w-px h-8 bg-slate-200 self-center" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">450+ Units</span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider mt-1.5">Active Fleet Inventory</span>
            </div>
            <div className="w-px h-8 bg-slate-200 self-center" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">99.8%</span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider mt-1.5">Operational Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Column - Light Spec Card */}
        <div className="lg:col-span-5 hidden lg:block animate-fade-in">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-floating overflow-hidden group card-premium-glow">
            {/* Blueprint Grid pattern specific to card */}
            <div className="absolute inset-0 blueprint-grid opacity-30" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-main/5 rounded-full blur-2xl pointer-events-none" />

            {/* Industrial corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-accent/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-slate-300" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-slate-300" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-accent/50" />

            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Active Spec Sheet</span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">Caterpillar 320D L</h3>
                </div>
                <span className="px-2 py-1 text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 rounded">READY TO LOG</span>
              </div>

              {/* Technical Drawing SVG preview */}
              <div className="w-full h-44 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden mb-6 relative group-hover:border-brand-main/30 transition-all">
                <svg className="w-36 h-36 text-brand-main opacity-70" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                  {/* Boom arm */}
                  <path strokeWidth="1" d="M15 75 L35 45 L65 30 L85 55" strokeLinecap="round" />
                  {/* Bucket */}
                  <path strokeWidth="1" d="M85 55 L80 62 L70 58 Z" fill="rgba(53, 92, 255, 0.08)" stroke="currentColor" />
                  {/* Cabin cab */}
                  <rect x="25" y="60" width="16" height="15" rx="2" strokeWidth="1" />
                  {/* Tracks */}
                  <rect x="15" y="75" width="36" height="8" rx="4" strokeWidth="1.5" />
                  <circle cx="20" cy="79" r="2.5" strokeWidth="1" />
                  <circle cx="28" cy="79" r="2.5" strokeWidth="1" />
                  <circle cx="36" cy="79" r="2.5" strokeWidth="1" />
                  <circle cx="44" cy="79" r="2.5" strokeWidth="1" />
                  {/* Tech Lines */}
                  <line x1="33" y1="45" x2="33" y2="90" stroke="rgba(255, 138, 0, 0.25)" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="10" y1="75" x2="90" y2="75" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="0.5" />
                  <line x1="65" y1="10" x2="65" y2="85" stroke="rgba(53, 92, 255, 0.15)" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
                {/* Tech specification pills */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white text-[8px] text-slate-500 font-bold border border-slate-200 shadow-sm">
                  R: 6.54m
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white text-[8px] text-slate-500 font-bold border border-slate-200 shadow-sm">
                  H: 3.20m
                </div>
              </div>

              {/* Specifications table */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Net Power</span>
                  <span className="text-slate-900 font-black">110 kW (148 HP)</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Operating Weight</span>
                  <span className="text-slate-900 font-black">21,500 kg</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Max Dig Depth</span>
                  <span className="text-slate-900 font-black">6,650 mm</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Bucket Capacity</span>
                  <span className="text-slate-900 font-black">1.2 m³</span>
                </div>
              </div>

              {/* View details CTA */}
              <button
                onClick={() => navigate('/marketplace?q=excavator')}
                className="w-full mt-6 py-3 bg-slate-50 hover:bg-brand-main/5 text-slate-700 hover:text-brand-main border border-slate-200 hover:border-brand-main/30 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                Inspect Spec Directory
                <svg className="w-3.5 h-3.5 text-brand-accent transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumHero;
