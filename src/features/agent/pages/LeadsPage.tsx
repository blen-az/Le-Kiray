import React, { useState, useEffect } from 'react';
import { QuoteRequest, LeadStatus } from '../../../types';
import { getLeadsByAgent, updateLeadStatus } from '../../../services/leadService';
import { useAuth } from '../../../features/auth/context/AuthContext';

const STATUS_OPTIONS: { 
  value: LeadStatus; 
  label: string; 
  actionLabel: string;
  badgeClass: string; 
  btnSelectedClass: string; 
  btnActionClass: string;
}[] = [
  { 
    value: 'new', 
    label: 'New', 
    actionLabel: 'Mark New',
    badgeClass: 'bg-blue-50 text-blue-600 border border-blue-250/50', 
    btnSelectedClass: 'bg-brand-main text-white shadow-md shadow-brand-main/20',
    btnActionClass: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
  },
  { 
    value: 'contacted', 
    label: 'Contacted', 
    actionLabel: 'Contacted',
    badgeClass: 'bg-purple-50 text-purple-600 border border-purple-250/50', 
    btnSelectedClass: 'bg-purple-600 text-white shadow-md shadow-purple-600/20',
    btnActionClass: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
  },
  { 
    value: 'quoted', 
    label: 'Quoted', 
    actionLabel: 'Quoted',
    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-250/50', 
    btnSelectedClass: 'bg-[#FF8A00] text-white shadow-md shadow-brand-accent/20',
    btnActionClass: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
  },
  { 
    value: 'won', 
    label: 'Accepted', 
    actionLabel: 'Accept',
    badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-250/50', 
    btnSelectedClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20',
    btnActionClass: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
  },
  { 
    value: 'lost', 
    label: 'Cancelled', 
    actionLabel: 'Cancel',
    badgeClass: 'bg-rose-50 text-rose-600 border border-rose-250/50', 
    btnSelectedClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20',
    btnActionClass: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
  },
  { 
    value: 'closed', 
    label: 'Closed', 
    actionLabel: 'Close',
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-250/50', 
    btnSelectedClass: 'bg-slate-700 text-white shadow-md shadow-slate-700/20',
    btnActionClass: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
  },
];

const LeadsPage: React.FC = () => {
  const { currentUser: user } = useAuth();
  const agentId = user?.id || '';
  
  if (!user) return null;
  const [leads, setLeads] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    loadLeads();
  }, [agentId]);

  const loadLeads = async () => {
    try {
      const data = await getLeadsByAgent(agentId);
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      loadLoading();
    }
  };

  const loadLoading = () => {
    // Keep consistent with state setters
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateLeadStatus(id, status);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      if (selectedLead?.id === id) {
        setSelectedLead(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredLeads = leads.filter(l => filter === 'all' || l.status === filter);

  const getStatusBadgeClass = (status: LeadStatus) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option?.badgeClass || 'bg-slate-100 text-slate-500 border border-slate-200';
  };

  const getStatusLabel = (status: LeadStatus) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option?.label || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] blueprint-grid">
        <div className="w-10 h-10 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-[#F7F9FC] blueprint-grid">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Booking Requests <span className="text-[#FF8A00] font-medium text-lg px-2.5 py-0.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">Leads</span>
          </h1>
          <p className="text-slate-500 mt-1">Manage project-based booking requests and lead statuses for your fleet</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="relative overflow-hidden bg-brand-main/5 border border-brand-main/10 rounded-3xl p-6 mb-8 flex items-start gap-4 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-main to-[#FF8A00]" />
        <div className="w-10 h-10 rounded-xl bg-brand-main/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm">Enterprise Facilitation Model</h4>
          <p className="text-slate-500 text-xs mt-1">
            Rental agreements and contracts are concluded directly with the provider. Le'Kiray provides secure discovery, communication, and lead generation routing.
          </p>
        </div>
      </div>

      {/* Filters (Linear Inspired Segmented Tab Control) */}
      <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl flex gap-1 mb-8 overflow-x-auto shadow-premium max-w-max">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All ({leads.length})
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = leads.filter(l => l.status === opt.value).length;
          if (count === 0 && opt.value !== 'new') return null;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === opt.value
                  ? opt.btnSelectedClass
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Leads List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`bg-white border-2 rounded-[22px] p-6 cursor-pointer transition-all shadow-dribbble card-premium-glow ${
                  selectedLead?.id === lead.id
                    ? 'border-brand-main bg-brand-main/[0.01]'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {lead.status === 'new' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
                      )}
                      <h3 className="font-extrabold text-slate-900 text-lg tracking-tight hover:text-brand-main transition-colors">{lead.listingName}</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <span>{lead.consumerName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#FF8A00]">{lead.projectLocation}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeClass(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                <div className="flex gap-6 text-xs pt-2 border-t border-slate-50">
                  <div>
                    <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Duration</p>
                    <p className="text-slate-900 font-extrabold mt-1">{lead.duration}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Scope of Work</p>
                    <p className="text-slate-900 font-bold mt-1 truncate">{lead.scopeOfWork}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-16 text-center shadow-premium dots-grid">
              <div className="w-20 h-20 bg-brand-main/5 border border-brand-main/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No bookings yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">Booking requests will appear here when customers inquire about your equipment.</p>
            </div>
          )}
        </div>

        {/* Lead Detail */}
        <div className="lg:col-span-1">
          {selectedLead ? (
            <div className="bg-white border-2 border-slate-100 rounded-[24px] p-6 sticky top-28 shadow-dribbble space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Lead Details</h3>
                <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">ID: #{selectedLead.id.substring(0, 6)}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Equipment</p>
                  <p className="text-slate-900 font-extrabold text-md">{selectedLead.listingName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Customer Profile</p>
                  <p className="text-slate-900 font-extrabold">{selectedLead.consumerName}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedLead.consumerEmail}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedLead.consumerPhone}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Project Location</p>
                  <p className="text-slate-900 font-bold text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {selectedLead.projectLocation}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-slate-900 font-bold text-sm">{selectedLead.duration}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Scope of Work</p>
                  <p className="text-slate-800 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/50 leading-relaxed font-medium">
                    {selectedLead.scopeOfWork}
                  </p>
                </div>
                {selectedLead.requestedStartDate && (
                  <div>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Project Timeline</p>
                    <p className="text-slate-900 font-bold text-sm">
                      {selectedLead.requestedStartDate} {selectedLead.requestedEndDate ? `— ${selectedLead.requestedEndDate}` : ''}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-6">
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.filter(s => s.value !== selectedLead.status).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(selectedLead.id, opt.value)}
                      className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${opt.btnActionClass}`}
                    >
                      {opt.actionLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 text-center shadow-premium dots-grid">
              <p className="text-slate-500 font-bold text-xs">Select a request card to manage the booking pipeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;

