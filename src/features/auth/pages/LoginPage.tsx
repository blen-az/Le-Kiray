import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../../services/authService';
import { UserRole } from '../../../types';

const LoginPage: React.FC = () => {
 const navigate = useNavigate();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 const user = await login(email, password);
 console.log('Login successful, user:', user.id, 'role:', user.role);
 
 // Route based on user role
 let redirectPath = '/marketplace';
 if (user.role === UserRole.ADMIN) {
 redirectPath = '/admin';
 } else if (user.role === UserRole.AGENT) {
 redirectPath = '/agent/dashboard';
 }
 
 console.log('Redirecting to:', redirectPath);
 // Navigate immediately after successful login
 navigate(redirectPath, { replace: true });
 } catch (err: any) {
 console.error('Login error:', err.message);
 setError(err.message || 'Failed to login. Please check your credentials.');
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
 
 <div className="w-full max-w-md">
 <div className="text-center mb-10">
 <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
 <p className="text-slate-600 font-medium">Log in to manage your fleet or bookings.</p>
 </div>

 <div className="bg-white backdrop-blur-xl p-8 rounded-[32px] border border-slate-200 shadow-2xl">
 <form onSubmit={handleSubmit} className="space-y-6">
 {error && (
 <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
 {error}
 </div>
 )}

 <div>
 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
 <input
 required
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="pilot@lekiray.com"
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-brand-main transition-all"
 />
 </div>

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
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-4 bg-brand-main hover:bg-brand-main/90 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-main/10 transition-all hover:scale-[1.02]"
 >
 {loading ? (
 <div className="flex items-center justify-center gap-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>Authenticating...</span>
 </div>
 ) : (
 'Secure Login'
 )}
 </button>
 </form>

 <p className="text-center mt-8 text-sm text-slate-500 font-medium">
 Don't have an account?{' '}
 <Link to="/signup" className="text-brand-main hover:text-brand-main/80 font-bold underline underline-offset-4 decoration-brand-main/30">
 Sign Up
 </Link>
 </p>
 </div>
 </div>
 </div>
 );
};

export default LoginPage;
