
import React, { useState } from 'react';
import { User, Vehicle, Lead, Booking } from '../types';
import { VEHICLES, MOCK_LEADS, MOCK_BOOKINGS, PLANS } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AgentDashboardProps {
  user: User;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'inbox' | 'analytics' | 'subscription'>('fleet');
  const agentVehicles = VEHICLES.filter(v => v.agentId === user.id);
  
  const analyticsData = [
    { name: 'Mon', revenue: 4500, leads: 2 },
    { name: 'Tue', revenue: 9000, leads: 5 },
    { name: 'Wed', revenue: 15000, leads: 8 },
    { name: 'Thu', revenue: 12000, leads: 3 },
    { name: 'Fri', revenue: 22000, leads: 10 },
    { name: 'Sat', revenue: 35000, leads: 4 },
    { name: 'Sun', revenue: 28000, leads: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Fleet Command</h1>
          <p className="text-slate-500 mt-1 font-medium">{user.companyName} &bull; Pro Agent Status</p>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-[20px] border border-slate-800 shadow-xl">
          {['fleet', 'inbox', 'analytics', 'subscription'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'fleet' && (
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-black text-white">Active Inventory</h2>
               <p className="text-slate-500 text-sm font-medium">14 of 25 slots used in current plan.</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
              Add Vehicle
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {agentVehicles.map(v => (
              <div key={v.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col sm:flex-row gap-6 hover:border-slate-700 transition-all group">
                <div className="relative w-full sm:w-48 h-40 shrink-0 overflow-hidden rounded-2xl">
                   <img src={v.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                   <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-[8px] font-black text-white rounded-lg border border-slate-800 uppercase tracking-widest">{v.category}</span>
                   </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-white tracking-tight">{v.make} {v.model}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{v.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      v.status === 'available' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="mt-auto pt-6 flex gap-3">
                    <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all">Edit Details</button>
                    <button className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase border border-red-500/20 transition-all">Suspend</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-8">
              <h2 className="text-2xl font-black text-white">Project Leads <span className="text-amber-500">(Quote Required)</span></h2>
              {MOCK_LEADS.map(lead => (
                <div key={lead.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px]"></div>
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-slate-800 pb-8">
                     <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">New Inquiry</span>
                        <h4 className="text-2xl font-black text-white">{lead.vehicleName}</h4>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Request from {lead.consumerName}</p>
                     </div>
                     <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-xl font-black text-white">{lead.duration}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div>
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Site Location</h5>
                        <p className="text-sm text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">{lead.location}</p>
                     </div>
                     <div>
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Project Scope</h5>
                        <p className="text-sm text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">{lead.scopeOfWork}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-900/20">Send Proposal</button>
                    <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest rounded-2xl border border-slate-700">Archived</button>
                  </div>
                </div>
              ))}
           </div>
           <div className="lg:col-span-4 space-y-8">
              <h2 className="text-2xl font-black text-white">Recent Bookings</h2>
              <div className="space-y-4">
                 {MOCK_BOOKINGS.map(booking => (
                   <div key={booking.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h5 className="text-sm font-black text-white">{booking.vehicleName}</h5>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-widest">ID: {booking.id}</p>
                         </div>
                         <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg border border-emerald-500/20">Confirmed</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500 font-bold uppercase tracking-widest">Dates</span>
                         <span className="text-white font-black">{booking.startDate} to {booking.endDate}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-800">
                         <span className="text-slate-500 font-bold uppercase tracking-widest">Revenue</span>
                         <span className="text-indigo-400 font-black text-lg">{booking.totalPrice.toLocaleString()} ETB</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white tracking-tight">Revenue Stream</h3>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cars</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heavy</span>
                  </div>
                </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 900}} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b', padding: '15px'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
               <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Estimated MoM Earnings</p>
               <h3 className="text-4xl font-black mt-3 tracking-tighter">150,700 <span className="text-sm">ETB</span></h3>
               <div className="mt-8 flex items-center gap-2">
                 <div className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black">+14.2%</div>
                 <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">vs prev month</span>
               </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Close Rate</p>
               <h3 className="text-4xl font-black text-white mt-3 tracking-tighter">68%</h3>
               <div className="w-full bg-slate-950 h-2.5 rounded-full mt-8 border border-slate-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full w-[68%] rounded-full"></div>
               </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Velocity</p>
               <h3 className="text-4xl font-black text-amber-500 mt-3 tracking-tighter">High</h3>
               <p className="text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> 12 New Leads This Week
               </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-12">
          <div className="bg-slate-900 p-12 rounded-[48px] border-2 border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10"></div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
              <div>
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 mb-4 inline-block">Active Plan</span>
                <h3 className="text-4xl font-black text-white tracking-tighter">Growth Elite (Mixed)</h3>
                <p className="text-slate-500 mt-2 font-medium">Billed 2,500 ETB monthly &bull; Renewing in 12 days</p>
              </div>
              <button className="bg-white hover:bg-slate-100 text-indigo-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-white/10 hover:-translate-y-1">
                Manage Billing
              </button>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-800 pt-12">
               <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                     <span className="text-slate-500">Fleet Utilization (20 Limit)</span>
                     <span className="text-indigo-400">14 Active</span>
                  </div>
                  <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-slate-800 p-1">
                     <div className="bg-indigo-600 h-full w-[70%] rounded-full"></div>
                  </div>
               </div>
               <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">
                    Account status verified. Category rules compliant with regulatory sandbox guidelines.
                  </p>
               </div>
            </div>
          </div>

          <div>
             <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Expand Your Command</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map(plan => (
                  <div key={plan.id} className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] flex flex-col hover:border-indigo-500 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/10">
                    <h4 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4">{plan.name}</h4>
                    <div className="flex items-end gap-1 mb-8">
                      <span className="text-4xl font-black text-white tracking-tighter">{plan.monthlyFee.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">ETB / MO</span>
                    </div>
                    <ul className="text-sm text-slate-400 space-y-4 mb-10 font-medium">
                       <li className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Up to {plan.maxVehicles} Fleet Slots
                       </li>
                       <li className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Instant Dash Booking
                       </li>
                       <li className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> AI Integration Enabled
                       </li>
                    </ul>
                    <button className="mt-auto w-full py-4 bg-slate-950 text-white border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                      Select Elite Tier
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
