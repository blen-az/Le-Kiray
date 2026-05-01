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
 <svg className={`w-6 h-6 ${active ? 'text-brand-main' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
 </svg>
 )
 },
 {
 label: 'Explore',
 path: '/marketplace',
 icon: (active: boolean) => (
 <svg className={`w-6 h-6 ${active ? 'text-brand-main' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 )
 },
 {
 label: 'Bookings',
 path: user ? (user.role === UserRole.AGENT ? '/agent/bookings' : '/bookings') : '/login',
 icon: (active: boolean) => (
 <svg className={`w-6 h-6 ${active ? 'text-brand-main' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 )
 },
 {
 label: 'Messages',
 path: user ? '/messages' : '/login',
 icon: (active: boolean) => (
 <svg className={`w-6 h-6 ${active ? 'text-brand-main' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
 </svg>
 )
 },
 {
 label: 'Profile',
 path: user ? (user.role === UserRole.AGENT ? '/agent/profile' : '/profile') : '/login',
 icon: (active: boolean) => (
 <svg className={`w-6 h-6 ${active ? 'text-brand-main' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 )
 }
 ];

 return (
 <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex items-center justify-between z-50 transition-all pb-safe">
 {navItems.map((item) => {
 const isActive = location.pathname === item.path;
 return (
 <button
 key={item.label}
 onClick={() => navigate(item.path)}
 className="flex flex-col items-center gap-1 group"
 >
 <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
 {item.icon(isActive)}
 </div>
 <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-brand-main' : 'text-slate-500'}`}>
 {item.label}
 </span>
 {isActive && (
 <div className="absolute -bottom-1 w-1 h-1 bg-brand-main rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
 )}
 </button>
 );
 })}
 </nav>
 );
};

export default BottomNav;
