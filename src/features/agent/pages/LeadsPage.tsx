import React, { useState, useEffect } from 'react';
import { QuoteRequest, LeadStatus } from '../../../types';
import { getLeadsByAgent, updateLeadStatus } from '../../../services/leadService';

interface LeadsPageProps {
  agentId: string;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'amber' },
  { value: 'contacted', label: 'Contacted', color: 'blue' },
  { value: 'quoted', label: 'Quoted', color: 'indigo' },
  { value: 'won', label: 'Won', color: 'emerald' },
  { value: 'lost', label: 'Lost', color: 'red' },
  { value: 'closed', label: 'Closed', color: 'slate' },
];

const LeadsPage: React.FC<LeadsPageProps> = ({ agentId }) => {
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
      setLoading(false);
    }
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

  const getStatusColor = (status: LeadStatus) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option?.color || 'slate';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Leads <span className="text-amber-500">(Quote Requests)</span>
        </h1>
        <p className="text-slate-500 mt-1">Manage quote requests for earth-moving equipment</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-amber-500 text-sm">
          <strong>Note:</strong> Contracts are concluded directly with the provider. Le'Kiray facilitates lead generation only.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            filter === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
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
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === opt.value ? `bg-${opt.color}-600 text-white` : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <div 
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`bg-slate-900 border rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedLead?.id === lead.id ? 'border-amber-500' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {lead.status === 'new' && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      <h3 className="font-bold text-white text-lg">{lead.listingName}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{lead.consumerName} • {lead.projectLocation}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase bg-${getStatusColor(lead.status)}-500/10 text-${getStatusColor(lead.status)}-500`}>
                    {lead.status}
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Duration</p>
                    <p className="text-white font-medium">{lead.duration}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Scope</p>
                    <p className="text-white font-medium truncate">{lead.scopeOfWork}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2">No leads yet</h3>
              <p className="text-slate-500">Quote requests will appear here when customers inquire about your equipment.</p>
            </div>
          )}
        </div>

        {/* Lead Detail */}
        <div className="lg:col-span-1">
          {selectedLead ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-black text-white mb-6">Lead Details</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Equipment</p>
                  <p className="text-white font-bold">{selectedLead.listingName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-white font-bold">{selectedLead.consumerName}</p>
                  <p className="text-sm text-slate-400">{selectedLead.consumerEmail}</p>
                  <p className="text-sm text-slate-400">{selectedLead.consumerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Project Location</p>
                  <p className="text-white font-medium">{selectedLead.projectLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-white font-medium">{selectedLead.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Scope of Work</p>
                  <p className="text-white text-sm bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {selectedLead.scopeOfWork}
                  </p>
                </div>
                {selectedLead.requestedStartDate && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Requested Start</p>
                    <p className="text-white font-medium">{selectedLead.requestedStartDate}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.filter(s => s.value !== selectedLead.status).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(selectedLead.id, opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold bg-${opt.color}-500/10 text-${opt.color}-500 hover:bg-${opt.color}-500/20 transition-colors`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm">Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;
