const fs = require('fs');

let navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const dropdownCode = `
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 hover:border-slate-400 transition-all flex items-center justify-center font-black text-slate-500 text-lg"
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 md:hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(user.role === UserRole.AGENT ? '/agent/profile' : '/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
`;

// Replace the existing button block with the new dropdown block
navbar = navbar.replace(
  /<button[\s\S]*?onClick=\{onLogout\}[\s\S]*?className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 hover:border-slate-400 transition-all relative group flex items-center justify-center font-black text-slate-500 text-lg"[\s\S]*?<\/button>/,
  dropdownCode.trim()
);

fs.writeFileSync('src/components/layout/Navbar.tsx', navbar);
console.log('Navbar dropdown updated.');
