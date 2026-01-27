
import React from 'react';
import { User, UserRole } from '../src/types';

interface NavbarProps {
  user: User;
  onSwitchRole: (role: UserRole) => void;
  onHome: () => void;
  onMarketplace: () => void;
  onDashboard: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSwitchRole, onHome, onMarketplace, onDashboard }) => {
  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onHome}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:bg-indigo-500 transition-all group-hover:rotate-6">
            LK
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">Le'Kiray</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={onMarketplace} className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors">MARKETPLACE</button>
          {user.role === UserRole.AGENT && (
            <button onClick={onDashboard} className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors">FLEET DASH</button>
          )}
          {user.role === UserRole.ADMIN && (
            <button onClick={() => onSwitchRole(UserRole.ADMIN)} className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors">ADMIN</button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button 
              onClick={() => onSwitchRole(UserRole.CONSUMER)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${user.role === UserRole.CONSUMER ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              USER
            </button>
            <button 
              onClick={() => onSwitchRole(UserRole.AGENT)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${user.role === UserRole.AGENT ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              AGENT
            </button>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-800">
              <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} alt="Avatar" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
