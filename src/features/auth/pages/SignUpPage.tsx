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
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-main/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Join Le'Kiray</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Choose your role and start your journey</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-premium">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 border border-slate-200">
            <button
              type="button"
              onClick={() => setRole(UserRole.CONSUMER)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                role === UserRole.CONSUMER 
                  ? 'bg-brand-main text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Consumer
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.AGENT)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                role === UserRole.AGENT 
                  ? 'bg-brand-accent text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Fleet Agent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Abebe Bikila"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abebe@example.com"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 focus:bg-white transition-all text-xs font-bold"
                />
              </div>
            </div>

            {role === UserRole.AGENT && (
              <div className="animate-fade-in">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ethiopian Fleet Solutions"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 focus:bg-white transition-all text-xs font-bold"
                />
              </div>
            )}

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
              <p className="mt-2 ml-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Must be at least 6 characters.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 duration-200 mt-4 ${
                role === UserRole.AGENT 
                  ? 'bg-brand-accent hover:bg-brand-accent/90 shadow-brand-accent/10' 
                  : 'bg-brand-main hover:bg-brand-main/90 shadow-brand-main/10'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                role === UserRole.AGENT ? 'Initialize Agent Account' : 'Create Consumer Account'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-main hover:text-brand-main/80 font-black underline underline-offset-4 decoration-brand-main/30">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
