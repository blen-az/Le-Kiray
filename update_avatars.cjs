const fs = require('fs');

// 1. Navbar.tsx
let navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
navbar = navbar.replace(
  /className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 hover:border-slate-400 transition-all relative group"/,
  'className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 hover:border-slate-400 transition-all relative group flex items-center justify-center font-black text-slate-500 text-lg"'
);
navbar = navbar.replace(
  /<img src=\{user\.avatar \|\| `https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{user\.id\}`\} alt="Avatar" className="w-full h-full object-cover" \/>/,
  `{user.avatar ? (\n  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />\n) : (\n  <span>{user.name?.charAt(0).toUpperCase()}</span>\n)}`
);
fs.writeFileSync('src/components/layout/Navbar.tsx', navbar);


// 2. UserProfilePage.tsx
let profile = fs.readFileSync('src/features/auth/pages/UserProfilePage.tsx', 'utf8');
profile = profile.replace(
  /className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-100 bg-slate-50 "/,
  'className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center text-4xl font-black text-slate-400"'
);
profile = profile.replace(
  /<img src=\{user\.avatar \|\| `https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{user\.id\}`\} alt="Avatar" className="w-full h-full object-cover" \/>/,
  `{user.avatar ? (\n  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />\n) : (\n  <span>{user.name?.charAt(0).toUpperCase()}</span>\n)}`
);
fs.writeFileSync('src/features/auth/pages/UserProfilePage.tsx', profile);


// 3. AgentLayout.tsx
let agent = fs.readFileSync('src/features/agent/components/AgentLayout.tsx', 'utf8');
agent = agent.replace(
  /className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800"/,
  'className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center font-black text-slate-400 text-lg"'
);
agent = agent.replace(
  /<img \s*\n\s*src=\{user\.avatar \|\| 'https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=Agent'\} \s*\n\s*alt="Avatar" \s*\n\s*className="w-full h-full object-cover"\s*\n\s*\/>/m,
  `{user.avatar ? (\n  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />\n) : (\n  <span>{user.name?.charAt(0).toUpperCase()}</span>\n)}`
);
fs.writeFileSync('src/features/agent/components/AgentLayout.tsx', agent);

console.log('Avatars updated.');
