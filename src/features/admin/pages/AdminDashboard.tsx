
import React from 'react';
import { VEHICLES } from '../../../data/mockData';

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-black text-white tracking-tight">Platform Intelligence</h1>
        <p className="text-slate-500 mt-1 font-medium tracking-wide uppercase text-xs">Global oversight and enforcement node</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-indigo-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Active Partners</p>
          <div className="flex items-end justify-between">
             <h3 className="text-4xl font-black text-white tracking-tighter">124</h3>
             <span className="text-emerald-500 text-[10px] font-black">+12.4%</span>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-indigo-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Global Fleet</p>
          <div className="flex items-end justify-between">
             <h3 className="text-4xl font-black text-white tracking-tighter">1,402</h3>
             <span className="text-indigo-400 text-[10px] font-black">Stable</span>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-amber-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Moderation Queue</p>
          <div className="flex items-end justify-between">
             <h3 className="text-4xl font-black text-amber-500 tracking-tighter">08</h3>
             <span className="text-amber-400/50 text-[10px] font-black">Action Required</span>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-emerald-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">ARR Forecast</p>
          <div className="flex items-end justify-between">
             <h3 className="text-4xl font-black text-white tracking-tighter">2.4<span className="text-xl">M</span></h3>
             <span className="text-emerald-500 text-[10px] font-black">+1.2M YTD</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl relative">
        <div className="p-10 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h3 className="text-2xl font-black text-white tracking-tight">Agent Moderation Hub</h3>
             <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Enforcing category & subscription compliance</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-slate-950 hover:bg-slate-800 text-slate-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-all">Export Logs</button>
             <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Review All</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Entity</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Modality</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Elite Tier</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-950/30 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {['AT', 'CR', 'HM', 'NX', 'EL'][i-1]}
                      </div>
                      <div>
                        <p className="font-black text-sm text-white">{['Atlas Heavy', 'City Rent', 'Heavy Move', 'NextGen Fleet', 'Elite Rental'][i-1]}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Applied {i}h ago</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {i % 2 === 0 ? 'Mixed Fleet' : 'Earth Moving Only'}
                  </td>
                  <td className="px-10 py-6 text-xs font-black text-white uppercase tracking-widest">
                    {i % 3 === 0 ? 'Pro' : 'Growth'}
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-500/20">Pending Review</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                       <button className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:underline transition-all">Authorize</button>
                       <button className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline transition-all">Deny</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
