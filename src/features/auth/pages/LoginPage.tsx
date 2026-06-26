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
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-main/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Log in to manage your bookings or fleet</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@lekiray.com"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-main hover:bg-brand-main/90 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-2xl transition-all shadow-md shadow-brand-main/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 duration-200"
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

          <p className="text-center mt-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-main hover:text-brand-main/80 font-black underline underline-offset-4 decoration-brand-main/30">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
