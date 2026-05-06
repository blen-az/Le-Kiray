import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingAgents, resendAgentInvite, createAgentWithInvite, approveAgentAccount, suspendAgentAccount, manuallyActivateAgent } from '../../../services/onboardingService';

interface Agent {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone?: string;
  status: string;
  inviteStatus?: string;
  isApproved?: boolean;
  isSuspended?: boolean;
  createdAt: string;
}

const AdminAgentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['admin-agents'],
    queryFn: getPendingAgents,
  });

  const approveMutation = useMutation({
    mutationFn: (agentId: string) => approveAgentAccount(agentId, 'admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      setSelectedAgent(null);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ agentId, reason }: { agentId: string; reason: string }) =>
      suspendAgentAccount(agentId, 'admin', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      setSelectedAgent(null);
    },
  });

  const getStatusBadge = (agent: Agent) => {
    if (agent.isApproved) return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">✓ Approved</span>;
    return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-500/20">⌛ Pending Approval</span>;
  };

  const filtered = agents.filter((a: Agent) => {
    if (filterTab === 'pending') return !a.isApproved && !a.isSuspended;
    if (filterTab === 'approved') return a.isApproved && !a.isSuspended;
    if (filterTab === 'suspended') return a.isSuspended;
    return true;
  });

  const stats = {
    total: agents.length,
    approved: agents.filter((a: Agent) => a.isApproved && !a.isSuspended).length,
    pending: agents.filter((a: Agent) => !a.isApproved && !a.isSuspended).length,
    suspended: agents.filter((a: Agent) => a.isSuspended).length,
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Agent Management</h1>
          <p className="text-slate-500 mt-1">Review and approve agent registrations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'border-slate-700 text-white' },
          { label: 'Approved', value: stats.approved, color: 'border-emerald-500/20 text-emerald-400' },
          { label: 'Pending', value: stats.pending, color: 'border-amber-500/20 text-amber-400' },
          { label: 'Suspended', value: stats.suspended, color: 'border-red-500/20 text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-slate-900 border rounded-2xl p-4 ${color}`}>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>


      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'suspended'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filterTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Agents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Company</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No agents in this category.</td></tr>
              ) : (
                filtered.map((agent: Agent) => (
                  <tr
                    key={agent.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm">{agent.name}</p>
                      <p className="text-slate-500 text-xs">{agent.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{agent.companyName}</td>
                    <td className="px-6 py-4">{getStatusBadge(agent)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {!agent.isApproved && !agent.isSuspended && (
                          <button
                            onClick={() => approveMutation.mutate(agent.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {agent.isApproved && !agent.isSuspended && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Suspend ${agent.name}? They will lose publishing access.`)) {
                                suspendMutation.mutate({ agentId: agent.id, reason: 'Suspended by admin' });
                              }
                            }}
                            disabled={suspendMutation.isPending}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[10px] font-black uppercase border border-red-500/20 rounded-lg transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {agent.isSuspended && (
                          <button
                            onClick={() => approveMutation.mutate(agent.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                          >
                            Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-white">{selectedAgent.name}</h2>
                <p className="text-slate-400 text-sm">{selectedAgent.companyName}</p>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { label: 'Email', value: selectedAgent.email },
                { label: 'Phone', value: selectedAgent.phone || '—' },
                { label: 'Joined', value: new Date(selectedAgent.createdAt).toLocaleDateString() },
                { label: 'Account Status', value: selectedAgent.isSuspended ? 'Suspended' : selectedAgent.isApproved ? 'Approved' : 'Pending Approval' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {!selectedAgent.isApproved && !selectedAgent.isSuspended && (
                <button
                  onClick={() => approveMutation.mutate(selectedAgent.id)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Approve Account
                </button>
              )}
              {selectedAgent.isApproved && !selectedAgent.isSuspended && (
                <button
                  onClick={() => {
                    suspendMutation.mutate({ agentId: selectedAgent.id, reason: 'Suspended by admin' });
                  }}
                  className="flex-1 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm transition-colors"
                >
                  Suspend Agent
                </button>
              )}
              {selectedAgent.isSuspended && (
                <button
                  onClick={() => approveMutation.mutate(selectedAgent.id)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Reinstate Agent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentManagement;
