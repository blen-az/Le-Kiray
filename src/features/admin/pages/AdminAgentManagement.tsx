import React, { useState, useEffect } from 'react';
import { getPendingAgents, resendAgentInvite, createAgentWithInvite } from '../../../services/onboardingService';

interface Agent {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone?: string;
  status: string;
  inviteStatus?: string;
  inviteToken?: string;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  companyName: string;
  phone: string;
  initialPlan: string;
}

const AdminAgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    initialPlan: 'STANDARD',
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const agentsList = await getPendingAgents();
      setAgents(agentsList);

      const approved = agentsList.filter(a => a.status === 'APPROVED').length;
      const pending = agentsList.filter(a => a.status === 'PENDING').length;

      setStats({
        total: agentsList.length,
        approved,
        pending,
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAgentWithInvite('admin_current', {
        fullName: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        phone: formData.phone,
        initialPlan: formData.initialPlan,
      });

      setFormData({
        name: '',
        email: '',
        companyName: '',
        phone: '',
        initialPlan: 'STANDARD',
      });
      setShowCreateForm(false);

      // Refresh agents list
      await fetchAgents();
      alert('Agent created successfully!');
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    }
  };

  const handleResendInvite = async (agentId: string) => {
    try {
      const newToken = await resendAgentInvite(agentId, 'admin_resend');
      const inviteLink = `${window.location.origin}/agent/activate?token=${newToken}`;
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
      await fetchAgents();
    } catch (error) {
      console.error('Error resending invite:', error);
      alert('Failed to resend invite');
    }
  };

  const getStatusBadge = (status: string, inviteStatus?: string) => {
    if (status === 'APPROVED' && inviteStatus === 'USED') {
      return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">✓ Activated</span>;
    }
    if (status === 'PENDING' || inviteStatus === 'SENT') {
      return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-500/20">⏳ Pending</span>;
    }
    if (inviteStatus === 'EXPIRED') {
      return <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20">✕ Expired</span>;
    }
    return <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-600/20">Unknown</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Agent Management</h1>
        <p className="text-slate-500 mt-1">Create, approve, and manage platform agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Approved</p>
          <p className="text-2xl font-black text-emerald-400">{stats.approved}</p>
        </div>
        <div className="bg-amber-600/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
        </div>
      </div>

      {/* Create Agent Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="mb-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
      >
        {showCreateForm ? 'Cancel' : '+ Create Agent'}
      </button>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-black text-white mb-6">Create New Agent</h2>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={formData.initialPlan}
                onChange={(e) => setFormData({ ...formData, initialPlan: e.target.value })}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="STARTER">Starter</option>
                <option value="STANDARD">Standard</option>
                <option value="PROFESSIONAL">Professional</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors w-full"
            >
              Create Agent
            </button>
          </form>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Company</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-bold">{agent.name}</td>
                  <td className="px-6 py-4 text-slate-400">{agent.companyName}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{agent.email}</td>
                  <td className="px-6 py-4">{getStatusBadge(agent.status, agent.inviteStatus)}</td>
                  <td className="px-6 py-4">
                    {agent.inviteStatus === 'SENT' || agent.inviteStatus === 'EXPIRED' ? (
                      <button
                        onClick={() => handleResendInvite(agent.id)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-bold"
                      >
                        Resend
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {agents.length === 0 && (
          <div className="p-8 text-center text-slate-500">No agents yet. Create one to get started.</div>
        )}
      </div>
    </div>
  );
};

export default AdminAgentManagement;
