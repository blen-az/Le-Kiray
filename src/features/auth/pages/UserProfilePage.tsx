import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';

const UserProfilePage: React.FC = () => {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'company' | 'documents' | 'history' | 'settings'>('overview');
  
  // Local form state mock for company info
  const [companyName, setCompanyName] = useState('Blen Construction Plc');
  const [taxId, setTaxId] = useState('T-9821-X90');
  const [opsHub, setOpsHub] = useState('Addis Ababa, Zone 3');

  if (!user) return null;

  const stats = [
    { label: 'Cumulative Leases', value: '28 units', desc: 'Machinery deployed' },
    { label: 'Completed Scopes', value: '24 units', desc: 'Contracts closed' },
    { label: 'Ongoing Operations', value: '3 units', desc: 'Active deployments' },
    { label: 'Lease Capital Spent', value: '450K ETB', desc: 'Account volume' }
  ];

  const recentBookings = [
    {
      id: 'B-82347',
      model: 'Hitachi ZX210LC-6 Excavator',
      dates: 'May 10 – May 16, 2025',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400'
    },
    {
      id: 'B-71932',
      model: 'BOMAG BW 213 D-5 Compactor',
      dates: 'Jun 20 – Jun 26, 2025',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1580983218765-f663becf48d4?auto=format&fit=crop&w=400'
    }
  ];

  const docVault = [
    { name: 'Commercial Liability Insurance policy', file: 'LIABILITY_POLICY_2026.pdf', size: '2.4 MB', state: 'Verified' },
    { name: 'Business Registration certificate', file: 'CERT_OF_REG_BLEN.pdf', size: '1.2 MB', state: 'Verified' },
    { name: 'Operator Safety licenses', file: 'OP_SAFETY_CERT_COMBINED.pdf', size: '4.8 MB', state: 'Reviewing' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen pb-24 font-sans animate-fade-in">
      
      {/* CAD Line divider */}
      <div className="w-full h-[1px] bg-slate-200/60" />

      {/* Enterprise Profile Header Card */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-8 shadow-dribbble flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        {/* Subtle CAD accent */}
        <div className="absolute top-0 right-0 w-24 h-24 industrial-stripes-subtle rotate-45 translate-x-12 -translate-y-12" />

        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center text-3xl font-black text-slate-400 shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{user.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                Insurance Verified
              </span>
            </div>
          </div>
          <p className="text-slate-450 text-[10px] font-black uppercase tracking-widest">Enterprise Contractor Account</p>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">📞</span>
              <span className="font-semibold text-[11px]">+251 912 345 678</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">✉️</span>
              <span className="font-semibold text-[11px]">{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">📍</span>
              <span className="font-semibold text-[11px]">Addis Ababa, zone 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector Tab control */}
      <div className="bg-white border border-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-sm overflow-x-auto scrollbar-none">
        {[
          { key: 'overview', label: 'Dashboard Overview' },
          { key: 'company', label: 'Company Credentials' },
          { key: 'documents', label: 'Document Vault' },
          { key: 'history', label: 'Fleet Lease History' },
          { key: 'settings', label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key 
                ? 'bg-brand-main text-white shadow shadow-brand-main/15' 
                : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-dribbble flex flex-col justify-between space-y-3">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  <div className="space-y-0.5">
                    <span className="text-xl font-black text-slate-900 block tracking-tight leading-none">{stat.value}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{stat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification status card */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-dribbble space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 font-black text-md shrink-0">✓</div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">Company Verified</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">License verified by Nile Ops</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 font-black text-md shrink-0">✓</div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">Insurance Bonded</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">10M ETB Liability policy verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Section */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-dribbble space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Deployments</h3>
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <img src={b.image} alt={b.model} className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-snug">{b.model}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">{b.dates}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      b.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-brand-main/5 text-brand-main border border-brand-main/15'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Company Credentials */}
        {activeTab === 'company' && (
          <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-dribbble space-y-6 animate-fade-in">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Company Credentials</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Registered Corporate Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-main focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Tax Identification Number (TIN)</label>
                <input 
                  type="text" 
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-main focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Primary Operations Coordinates / Hub</label>
                <input 
                  type="text" 
                  value={opsHub}
                  onChange={(e) => setOpsHub(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-main focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => alert('Company credentials saved.')}
                className="px-5 py-3 bg-brand-main hover:bg-brand-main/95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-main/15 cursor-pointer"
              >
                Save Credentials
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Document Vault */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-dribbble space-y-6 animate-fade-in">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Secure Document Vault</h3>
            
            <div className="space-y-3">
              {docVault.map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 leading-snug">{doc.name}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">{doc.file} • {doc.size}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                      doc.state === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {doc.state}
                    </span>
                    <button 
                      onClick={() => alert(`Replacing ${doc.name}...`)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-650 hover:border-brand-main hover:text-brand-main transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Upload slot */}
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <span className="text-2xl block">📤</span>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Upload New Operational Certificate</p>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">PDF, JPG, or PNG under 10MB</p>
            </div>
          </div>
        )}

        {/* Tab 4: Fleet Lease History & Usage Data */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-dribbble space-y-6 animate-fade-in">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Fleet Lease History</h3>
            
            {/* Visual metrics breakdown */}
            <div className="space-y-4 pt-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Usage metrics by machine category</span>
              
              {[
                { category: 'Excavators', hours: 420, percent: '75%' },
                { category: 'Bulldozers', hours: 180, percent: '40%' },
                { category: 'Cranes', hours: 90, percent: '20%' },
                { category: 'Compactors', hours: 45, percent: '10%' }
              ].map((met, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800">{met.category}</span>
                    <span className="text-slate-500 font-extrabold">{met.hours} Hours ({met.percent})</span>
                  </div>
                  <div className="h-2 bg-slate-50 border border-slate-150 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-main rounded-full" style={{ width: met.percent }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Total spend and stats list */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Rental Cost</span>
                <p className="text-lg font-black text-slate-900 mt-1">45,000 ETB</p>
                <p className="text-[8px] text-[#FF8A00] font-black uppercase tracking-wider mt-0.5">3 active contracts</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cumulative Lease Spent</span>
                <p className="text-lg font-black text-slate-900 mt-1">450,000 ETB</p>
                <p className="text-[8px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">24 completed scopes</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Settings Panel (Payment methods layout) */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-dribbble space-y-6 animate-fade-in">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Corporate Vault Payments</h3>
            
            {/* Mock credit card visual */}
            <div className="space-y-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Payment Vault</span>
              
              <div className="relative overflow-hidden w-full max-w-sm h-48 bg-gradient-to-br from-brand-main to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200">CORPORATE LEASE ACCOUNT</span>
                    <h4 className="text-sm font-black tracking-tight">{companyName}</h4>
                  </div>
                  <span className="text-lg font-black italic">VISA</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-md font-black tracking-[0.2em]">••••  ••••  ••••  9821</p>
                  <div className="flex justify-between text-[10px] font-extrabold text-indigo-100 uppercase tracking-wider">
                    <div>
                      <p className="text-[7px] text-indigo-300">Expiry Date</p>
                      <p className="mt-0.5">08/29</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-indigo-300">Security Index</p>
                      <p className="mt-0.5">CVV •••</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer details */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Operational Bank Wire Account</span>
              <p className="text-xs font-black text-slate-900 leading-snug">CBE Birr Corporate Wire</p>
              <p className="text-[10px] text-slate-500 font-semibold">Account Index: ••••-••••-0921-90</p>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => alert('New corporate payment method added.')}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Add Corporate Payment +
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfilePage;
