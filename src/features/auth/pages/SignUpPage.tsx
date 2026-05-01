import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../../../services/authService';
import { UserRole } from '../../../types';

const SignUpPage: React.FC = () => {
 const navigate = useNavigate();
 const [role, setRole] = useState<UserRole>(UserRole.CONSUMER);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [name, setName] = useState('');
 const [companyName, setCompanyName] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 const newUser = await signUp(email, password, name, role, role === UserRole.AGENT ? companyName : undefined);
 console.log('Signup successful, user:', newUser.id);
 const redirectPath = role === UserRole.AGENT ? '/agent/dashboard' : '/marketplace';
 console.log('Redirecting to:', redirectPath);
 
 // Navigate immediately after successful signup
 navigate(redirectPath, { replace: true });
 } catch (err: any) {
 console.error('Signup error:', err.message);
 setError(err.message || 'Failed to create account.');
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20">
 <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>
 
 <div className="w-full max-w-xl">
 <div className="text-center mb-10">
 <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Join Le'Kiray</h1>
 <p className="text-slate-600 font-medium">Choose your crew and start your journey.</p>
 </div>

 <div className="bg-white backdrop-blur-xl p-8 rounded-[40px] border border-slate-200 shadow-2xl">
 <div className="flex p-1 bg-slate-100 rounded-2xl mb-10 border border-slate-200 ">
 <button
 type="button"
 onClick={() => setRole(UserRole.CONSUMER)}
 className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
 role === UserRole.CONSUMER ? 'bg-brand-main text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 '
 }`}
 >
 Consumer
 </button>
 <button
 type="button"
 onClick={() => setRole(UserRole.AGENT)}
 className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
 role === UserRole.AGENT ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
 }`}
 >
 Fleet Agent
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
 {error}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
 <input
 required
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Abebe Bikila"
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-brand-main transition-all"
 />
 </div>

 <div>
 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
 <input
 required
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="abebe@example.com"
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-brand-main transition-all"
 />
 </div>
 </div>

 {role === UserRole.AGENT && (
 <div>
 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Company Name</label>
 <input
 required
 type="text"
 value={companyName}
 onChange={(e) => setCompanyName(e.target.value)}
 placeholder="Ethiopian Fleet Solutions"
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-brand-accent transition-all"
 />
 </div>
 )}

 <div>
 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
 <input
 required
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-brand-main transition-all"
 />
 <p className="mt-2 ml-1 text-[10px] text-slate-500 font-medium uppercase tracking-wide">Must be at least 6 characters long.</p>
 </div>

 <button
 type="submit"
 disabled={loading}
 className={`w-full py-5 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] mt-4 ${
 role === UserRole.AGENT ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/10' : 'bg-brand-main hover:bg-brand-main/90 shadow-brand-main/10'
 }`}
 >
 {loading ? (
 <div className="flex items-center justify-center gap-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>Initializing account...</span>
 </div>
 ) : (
 role === UserRole.AGENT ? 'Initialize Agent Account' : 'Create Consumer Account'
 )}
 </button>
 </form>

 <p className="text-center mt-8 text-sm text-slate-500 font-medium">
 Already have an account?{' '}
 <Link to="/login" className="text-brand-main hover:text-brand-main/80 font-bold underline underline-offset-4 decoration-brand-main/30">
 Sign In
 </Link>
 </p>
 </div>
 </div>
 </div>
 );
};

export default SignUpPage;
