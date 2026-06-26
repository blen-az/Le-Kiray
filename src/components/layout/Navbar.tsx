import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onDashboard: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 w-full">
      {/* Blueprint grid accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-main via-[#FF8A00] to-brand-main opacity-90" />

      <div className="w-full px-8 md:px-12 h-20 flex items-center justify-between">
        {/* Logo block with precise design accents */}
        <div 
          className="flex items-center gap-4 cursor-pointer group relative" 
          onClick={() => navigate('/')}
        >
          <div className="relative w-11 h-11 bg-brand-main rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg transition-all group-hover:scale-105 group-hover:rotate-3 shadow-md shadow-brand-main/30 overflow-hidden">
            <span className="relative z-10 font-black tracking-tighter text-sm">LK</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-[#FF8A00]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Tech line markings */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-white/20" />
            <div className="absolute left-0 right-0 top-1/2 h-[0.5px] bg-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Le'Kiray</span>
            <span className="text-[8px] font-black text-[#FF8A00] uppercase tracking-[0.3em] mt-1.5 leading-none">Fleet Command</span>
          </div>
        </div>

        {/* Primary Nav List (Linear Style Minimal Tabs) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          <button 
            onClick={() => navigate('/marketplace')} 
            className={`font-black text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
              isActive('/marketplace') 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Marketplace
          </button>
          
          {user?.role === UserRole.CONSUMER && (
            <>
              <button 
                onClick={() => navigate('/bookings')} 
                className={`font-black text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
                  isActive('/bookings') 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                My Bookings
              </button>
              <button 
                onClick={() => navigate('/messages')} 
                className={`font-black text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
                  isActive('/messages') 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Messages
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                className={`font-black text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
                  isActive('/profile') 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                My Profile
              </button>
            </>
          )}

          {user?.role === UserRole.AGENT && (
            <button 
              onClick={onDashboard} 
              className={`font-black text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
                isActive('/agent/dashboard') 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Fleet Dash
            </button>
          )}
          
          {user?.role === UserRole.ADMIN && (
            <button 
              onClick={() => navigate('/admin')} 
              className={`font-black text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
                isActive('/admin') 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin Control
            </button>
          )}
        </div>

        {/* Right side user elements & notifications */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200/60">
              {/* Notification Center */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200/60 transition-all relative shadow-sm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                </button>

                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-dribbble border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Alert Center</span>
                        <span className="text-[10px] text-brand-main font-black uppercase tracking-wider cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        <div className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                          <p className="text-xs font-black text-slate-800">Booking Confirmed</p>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">CAT 320D Excavator logistics verify complete.</p>
                          <span className="text-[9px] text-slate-400 mt-1.5 block font-bold">2 hours ago</span>
                        </div>
                        <div className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                          <p className="text-xs font-black text-slate-800">Inquiry Active</p>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">Yonas A. sent a new project timeline update request.</p>
                          <span className="text-[9px] text-slate-400 mt-1.5 block font-bold">Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Block */}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 truncate max-w-[125px] tracking-tight">{user.name}</p>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1 leading-none">{user.role}</p>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-slate-350 transition-all flex items-center justify-center font-black text-slate-500 text-sm shadow-sm"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </button>
                
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-dribbble border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-slate-100 sm:hidden bg-slate-50/50">
                        <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">{user.role}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate(user.role === UserRole.AGENT ? '/agent/profile' : '/profile');
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <button 
                onClick={() => navigate('/login')}
                className="text-slate-650 hover:text-slate-900 font-extrabold text-xs uppercase tracking-widest transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-5 py-3 bg-brand-main text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-brand-main/90 transition-all shadow-md shadow-brand-main/20 hover:-translate-y-0.5 duration-200"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
