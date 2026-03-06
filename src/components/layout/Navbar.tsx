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
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:bg-indigo-500 transition-all group-hover:rotate-6 shadow-lg shadow-indigo-900/40">
            LK
          </div>
          <span className="text-xl font-black text-white tracking-tighter">Le'Kiray</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/marketplace')} className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors">MARKETPLACE</button>
          {user?.role === UserRole.AGENT && (
            <button onClick={onDashboard} className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors">FLEET DASH</button>
          )}
          {user?.role === UserRole.ADMIN && (
            <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors">ADMIN PANEL</button>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-900 hover:border-slate-600 transition-all relative group"
              >
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
              <button 
                onClick={() => navigate('/login')}
                className="text-slate-400 hover:text-white font-bold text-sm tracking-wide transition-colors"
              >
                LOG IN
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40"
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
