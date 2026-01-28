import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingAgents, resendAgentInvite } from '../../../services/onboardingService';

interface Agent {
  id: string;
  name: string;
  email: string;
  companyName: string;
  status: string;
  inviteStatus?: string;
  inviteToken?: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        console.log('Fetching agents...');
        const agentsList = await getPendingAgents();
        console.log('Agents fetched:', agentsList);
        setAgents(agentsList);

        // Calculate stats
        const approved = agentsList.filter(a => a.status === 'APPROVED').length;
        const pending = agentsList.filter(a => a.status === 'PENDING').length;

        setStats({
          total: agentsList.length,
          approved,
          pending,
        });
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleResendInvite = async (agentId: string) => {
    try {
      console.log('Resending invite to agent:', agentId);
      const newToken = await resendAgentInvite(agentId, 'admin_current');
      const inviteLink = `${window.location.origin}/agent/activate?token=${newToken}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');

      // Refresh agents list
      const agentsList = await getPendingAgents();
      setAgents(agentsList);
    } catch (err) {
      console.error('Error resending invite:', err);
      alert('Failed to resend invite');
    }
  };

  const getStatusBadge = (status: string, inviteStatus?: string) => {
    if (status === 'APPROVED' && inviteStatus === 'USED') {
      return (
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
          ✓ Activated
        </span>
      );
    }
    if (status === 'PENDING' || inviteStatus === 'SENT') {
      return (
        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
          ⏳ Pending
        </span>
      );
    }
    if (inviteStatus === 'EXPIRED') {
      return (
        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20">
          ✕ Expired
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-600/20">
        Unknown
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-16">
        <h1 className="text-4xl font-black text-white tracking-tight">Platform Intelligence</h1>
        <p className="text-slate-500 mt-1 font-medium tracking-wide uppercase text-xs">Global oversight and agent management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-indigo-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Agents</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-white tracking-tighter">{stats.total}</h3>
            <span className="text-slate-400 text-[10px] font-black">All time</span>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-emerald-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Activated</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">{stats.approved}</h3>
            <span className="text-emerald-400 text-[10px] font-black">Ready</span>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-amber-500/50 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Pending Activation</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-amber-500 tracking-tighter">{stats.pending}</h3>
            <span className="text-amber-400/50 text-[10px] font-black">Awaiting</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl relative">
        <div className="p-10 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Agent Management</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">All registered fleet agents</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/admin/agents/new')}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              + Create Agent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading agents...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-400">
            {error}
          </div>
        ) : agents.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p>No agents created yet. Click "+ Create Agent" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent Name</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Company</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-950/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-amber-600 flex items-center justify-center text-white font-black text-xs">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-black text-sm text-white">{agent.name}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {agent.companyName}
                    </td>
                    <td className="px-10 py-6 text-xs text-slate-400 font-mono">
                      {agent.email}
                    </td>
                    <td className="px-10 py-6">
                      {getStatusBadge(agent.status, agent.inviteStatus)}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {(agent.inviteStatus === 'SENT' || agent.inviteStatus === 'EXPIRED') && (
                          <button
                            onClick={() => handleResendInvite(agent.id)}
                            className="text-indigo-400 hover:text-indigo-300 font-black text-[10px] uppercase tracking-widest hover:underline transition-all"
                          >
                            Resend
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:underline transition-all">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
