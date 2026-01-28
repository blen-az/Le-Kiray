import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgentWithInvite } from '../../../services/onboardingService';

interface FormData {
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  initialPlan: string;
  status: string;
}

const AdminCreateAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    initialPlan: 'STARTER',
    status: 'PENDING',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Creating agent with invite...');
      const result = await createAgentWithInvite('admin_current', {
        fullName: formData.fullName,
        email: formData.email,
        companyName: formData.companyName,
        phone: formData.phone,
        initialPlan: formData.initialPlan,
      });

      console.log('Agent created:', result.agentId);
      setInviteToken(result.inviteToken);
      // Create full URL for the link
      const fullLink = `${window.location.origin}/agent/activate?token=${result.inviteToken}`;
      setInviteLink(fullLink);
      setSuccess(true);
      setFormData({ fullName: '', email: '', companyName: '', phone: '', initialPlan: 'STARTER', status: 'PENDING' });
    } catch (err: any) {
      console.error('Error creating agent:', err);
      if (err.message?.includes('email-already-in-use')) {
        setError('This email is already registered.');
      } else {
        setError(err.message || 'Failed to create agent account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <button
            onClick={() => navigate('/admin')}
            className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-8 flex items-center gap-2"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Create New Agent</h1>
          <p className="text-slate-400 font-medium">Register a new fleet agent with onboarding invite</p>
        </div>

        {success && inviteLink && inviteToken ? (
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-slate-800 shadow-2xl">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider mb-8">
              ✓ Agent account created successfully!
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Onboarding Link</p>
                <p className="text-slate-400 text-sm mb-3">
                  Share this link with the agent. Valid for 24 hours.
                </p>
                <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <code className="text-indigo-400 text-xs font-mono break-all flex-1">{inviteLink}</code>
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Token</p>
                <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <code className="text-slate-300 text-xs font-mono break-all flex-1">{inviteToken}</code>
                  <button
                    onClick={() => copyToClipboard(inviteToken)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setInviteLink(null);
                    setInviteToken(null);
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-slate-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                  <input
                    required
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email *</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="agent@company.com"
                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Company Name *</label>
                  <input
                    required
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Fleet Company"
                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 9XX XXX XXXX"
                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Initial Plan</label>
                  <select
                    name="initialPlan"
                    value={formData.initialPlan}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="STARTER">Starter (5 vehicles)</option>
                    <option value="GROWTH">Growth (20 vehicles)</option>
                    <option value="PRO">Pro (Unlimited)</option>
                    <option value="CONTRACTOR_BASIC">Contractor Basic (Excavators)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Auto-Approved</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-900/30 transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Agent...</span>
                  </div>
                ) : (
                  'Create Agent & Send Invite'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreateAgentPage;
