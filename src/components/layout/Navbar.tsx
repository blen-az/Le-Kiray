import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../../types';

interface NavbarProps {
 user: User | null;
 onLogout: () => void;
 onDashboard: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onDashboard }) => {
 const navigate = useNavigate();
 const [isMenuOpen, setIsMenuOpen] = React.useState(false);

 return (
 <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
 <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center justify-between">
 <div 
 className="flex items-center gap-3 cursor-pointer group" 
 onClick={() => navigate('/')}
 >
 <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-main rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl hover:bg-brand-main/90 transition-all hover:rotate-6 shadow-lg shadow-brand-main/20">
 LK
 </div>
 <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">Le'Kiray</span>
 </div>

 <div className="hidden md:flex items-center gap-10">
 <button onClick={() => navigate('/marketplace')} className="text-slate-500 hover:text-slate-900 font-black text-[11px] tracking-[0.2em] transition-all relative group">
 MARKETPLACE
 <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-main transition-all group-hover:w-full" />
 </button>
 
 {user?.role === UserRole.CONSUMER && (
 <>
 <button onClick={() => navigate('/bookings')} className="text-slate-500 hover:text-slate-900 font-black text-[11px] tracking-[0.2em] transition-all relative group">
 MY BOOKINGS
 <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-main transition-all group-hover:w-full" />
 </button>
 <button onClick={() => navigate('/messages')} className="text-slate-500 hover:text-slate-900 font-black text-[11px] tracking-[0.2em] transition-all relative group">
 MESSAGES
 <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-main transition-all group-hover:w-full" />
 </button>
 <button onClick={() => navigate('/profile')} className="text-slate-500 hover:text-slate-900 font-black text-[11px] tracking-[0.2em] transition-all relative group">
 MY PROFILE
 <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-main transition-all group-hover:w-full" />
 </button>
 </>
 )}

 {user?.role === UserRole.AGENT && (
 <button onClick={onDashboard} className="text-slate-500 hover:text-slate-900 font-black text-[11px] tracking-[0.2em] transition-all relative group">
 FLEET DASH
 <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-main transition-all group-hover:w-full" />
 </button>
 )}
 
 {user?.role === UserRole.ADMIN && (
 <button onClick={() => navigate('/admin')} className="text-slate-500 hover:text-slate-900 font-black text-[11px] tracking-[0.2em] transition-all relative group">
 ADMIN PANEL
 <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-main transition-all group-hover:w-full" />
 </button>
 )}
 </div>

 <div className="flex items-center gap-6">
 {user ? (
 <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-slate-200 ">
 <div className="text-right hidden xs:block">
 <p className="text-[10px] sm:text-xs font-bold text-slate-900 truncate max-w-[80px] sm:max-w-none">{user.name}</p>
 <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
 </div>
 <button 
 onClick={onLogout}
 className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 hover:border-slate-400 transition-all relative group"
 >
 <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <svg className="w-5 h-5 text-slate-900 " fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
 </div>
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-slate-200 ">
 <button 
 onClick={() => navigate('/login')}
 className="text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm tracking-wide transition-colors"
 >
 LOG IN
 </button>
 <button 
 onClick={() => navigate('/signup')}
 className="px-4 py-1.5 sm:px-6 sm:py-2 bg-brand-main text-white text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/20"
 >
 SIGN UP
 </button>
 </div>
 )}
 </div>
 </div>
 </nav>
 );
};

export default Navbar;
