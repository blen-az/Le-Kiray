import React from 'react';

const SplashScreen: React.FC = () => {
 return (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden">
    {/* Dynamic Background Effects */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]"></div>
    
    {/* Main Logo Container */}
    <div className="relative flex flex-col items-center text-center animate-fade-in-up">
      {/* Animated Icon Placeholder / Graphic */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 animate-bounce-slow">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {/* Outer Ring Animation */}
        <div className="absolute inset-0 w-24 h-24 border-4 border-amber-500/20 rounded-3xl animate-ping opacity-20"></div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-[0.4em] mb-4 drop-shadow-sm">
        LE'KIRAY
      </h1>
      
      {/* Subtitle / Tagline */}
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-0 animate-fade-in delay-700">
        Industrial Equipment Marketplace
      </p>
    </div>

    {/* Premium Progress Loader */}
    <div className="absolute bottom-20 w-64 h-1 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 animate-loading-bar shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
    </div>

 <style>{`
 @keyframes loading-bar {
 0% { width: 0%; transform: translateX(-100%); }
 50% { width: 50%; transform: translateX(0%); }
 100% { width: 100%; transform: translateX(100%); }
 }
 .animate-loading-bar {
 animation: loading-bar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
 }
 @keyframes bounce-slow {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-10px); }
 }
 .animate-bounce-slow {
 animation: bounce-slow 3s ease-in-out infinite;
 }
 @keyframes fade-in-up {
 from { opacity: 0; transform: translateY(20px); }
 to { opacity: 1; transform: translateY(0); }
 }
 .animate-fade-in-up {
 animation: fade-in-up 1s ease-out forwards;
 }
 @keyframes fade-in {
 from { opacity: 0; }
 to { opacity: 1; }
 }
 .animate-fade-in {
 animation: fade-in 1.5s ease-out forwards;
 }
 .delay-700 {
 animation-delay: 0.7s;
 }
 `}</style>
 </div>
 );
};

export default SplashScreen;
