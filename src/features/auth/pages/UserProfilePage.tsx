import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';

const UserProfilePage: React.FC = () => {
 const { currentUser: user } = useAuth();
 
 if (!user) return null;

 return (
 <div className="p-8 max-w-4xl mx-auto">
 {/* Header */}
 <div className="mb-10">
 <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
 <p className="text-slate-500 mt-1">Manage your account information</p>
 </div>

 <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
 <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100 ">
 <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-100 bg-slate-50 ">
 <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-slate-900 ">{user.name}</h2>
 <p className="text-slate-500 font-medium">{user.email}</p>
 <div className="mt-3 inline-flex px-3 py-1 bg-brand-main/10 text-brand-main text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-main/20">
 {user.role}
 </div>
 </div>
 </div>

 <div className="space-y-8">
 <div>
 <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Full Name</label>
 <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
 {user.name}
 </div>
 </div>
 <div>
 <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
 <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
 {user.email}
 </div>
 </div>
 </div>
 
 <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
 <p className="text-sm text-slate-500 font-medium">Consumer profile editing is coming soon to the mobile app.</p>
 </div>
 </div>
 </div>
 );
};

export default UserProfilePage;
