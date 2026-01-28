import React, { useState } from 'react';

interface Dispute {
  id: string;
  type: 'booking' | 'lead';
  parties: string;
  status: 'open' | 'resolved' | 'rejected';
  description: string;
  createdAt: string;
}

const AdminDisputesReports: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('open');

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Disputes & Reports</h1>
        <p className="text-slate-500 mt-1">Maintain platform trust without becoming a broker</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {['open', 'resolved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Disputes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Parties</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No disputes in this status
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Abuse Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-black text-white mb-4">Abuse Reports</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">No abuse reports at this time</p>
        </div>
      </div>

      {/* Important Info */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-6">
        <h3 className="font-black text-amber-300 mb-3">⚠️ Admin Does Not:</h3>
        <ul className="text-amber-200/80 text-sm space-y-2">
          <li>✗ Edit booking prices or contracts</li>
          <li>✗ Negotiate between parties</li>
          <li>✗ Override agent decisions</li>
          <li>✗ Assume broker/mediator role</li>
        </ul>
      </div>

      {/* Guidelines Box */}
      <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-black text-white mb-3">Dispute Resolution</h3>
        <ol className="text-slate-400 text-sm space-y-2">
          <li>1. Log dispute with all parties' statements</li>
          <li>2. Note the resolution outcome (customer refund, terms clarified, etc.)</li>
          <li>3. Mark as resolved/rejected with notes</li>
          <li>4. Keep audit trail for regulator review</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminDisputesReports;
