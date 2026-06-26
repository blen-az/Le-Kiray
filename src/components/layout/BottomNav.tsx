import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';

interface BottomNavProps {
  user: User | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: (active: boolean) => (
        <svg className={`w-5.5 h-5.5 transition-all duration-300 ${active ? 'scale-115 text-brand-main' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: 'Explore',
      path: '/marketplace',
      icon: (active: boolean) => (
        <svg className={`w-5.5 h-5.5 transition-all duration-300 ${active ? 'scale-115 text-brand-main' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      label: 'Bookings',
      path: user ? (user.role === UserRole.AGENT ? '/agent/bookings' : '/bookings') : '/login',
      icon: (active: boolean) => (
        <svg className={`w-5.5 h-5.5 transition-all duration-300 ${active ? 'scale-115 text-brand-main' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Messages',
      path: user ? '/messages' : '/login',
      icon: (active: boolean) => (
        <svg className={`w-5.5 h-5.5 transition-all duration-300 ${active ? 'scale-115 text-brand-main' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      label: 'Profile',
      path: user ? (user.role === UserRole.AGENT ? '/agent/profile' : '/profile') : '/login',
      icon: (active: boolean) => (
        <svg className={`w-5.5 h-5.5 transition-all duration-300 ${active ? 'scale-115 text-brand-main' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex justify-center pb-safe">
      <nav className="w-full max-w-lg bg-white/90 backdrop-blur-2xl border border-slate-100 rounded-3xl px-5 py-3 flex items-center justify-between shadow-[0_24px_48px_rgba(53,92,255,0.08)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 group relative px-3.5 py-2 rounded-2xl transition-all duration-300"
            >
              {isActive && (
                <div className="absolute inset-0 bg-brand-main/5 rounded-2xl transition-all duration-300 scale-105" />
              )}
              <div className={`z-10 transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
                {item.icon(isActive)}
              </div>
              <span className={`z-10 text-[8px] font-black uppercase tracking-[0.15em] mt-0.5 transition-colors duration-300 ${isActive ? 'text-brand-main' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-[#FF8A00] rounded-full z-10 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
