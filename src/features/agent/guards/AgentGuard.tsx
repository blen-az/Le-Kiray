import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../../types';
import { useAuth } from '../../auth/context/AuthContext';

interface AgentGuardProps {
 children: React.ReactNode;
}

/**
 * Route guard that only allows Agent role users to access protected routes
 */
const AgentGuard: React.FC<AgentGuardProps> = ({ children }) => {
 const { currentUser: user } = useAuth();
 const location = useLocation();

 // No user logged in
 if (!user) {
 return <Navigate to="/" state={{ from: location }} replace />;
 }

 // User is not an agent
 if (user.role !== UserRole.AGENT) {
 return (
 <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in">
 <div className="bg-white border-2 border-slate-200 rounded-[48px] p-8 md:p-16 max-w-xl text-center shadow-2xl xl:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
 
 <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-red-500/20 shadow-lg shadow-red-500/10 rotate-3">
 <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 </div>
 
 <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Access Restricted</h2>
 <p className="text-slate-500 mb-2 font-medium">
 Your current profile role: <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] bg-indigo-500/5 px-2 py-1 rounded-md">{user.role}</span>
 </p>
 <p className="text-slate-400 text-sm mb-12 max-w-xs mx-auto">
 The Fleet Control Center requires <span className="text-slate-900 font-bold">AGENT</span> privileges. If you just signed up, please allow a moment for initialization.
 </p>
 
 <div className="flex flex-col gap-4">
 <button 
 onClick={() => window.location.href = '/'}
 className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
 >
 Return to Marketplace
 </button>
 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] pt-4">
 Security Protocol: {new Date().toLocaleTimeString()}
 </p>
 </div>
 </div>
 </div>
 );
 }

 return <>{children}</>;
};

export default AgentGuard;
