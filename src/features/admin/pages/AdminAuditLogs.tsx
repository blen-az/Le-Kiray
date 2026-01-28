import React, { useState, useEffect } from 'react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  reason?: string;
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        // In production, fetch from backend
        setLogs([]);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const actionTypes = [
    'AGENT_CREATED',
    'AGENT_APPROVED',
    'AGENT_SUSPENDED',
    'LISTING_FLAGGED',
    'LISTING_SUSPENDED',
    'SUBSCRIPTION_OVERRIDDEN',
    'DISPUTE_RESOLVED',
  ];

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
        <h1 className="text-3xl font-black text-white tracking-tight">Audit Logs</h1>
        <p className="text-slate-500 mt-1">All admin actions (read-only) • Regulator safety</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search by admin email or entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Actions</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No audit logs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Info */}
      <div className="mt-8 bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-6">
        <h3 className="font-black text-emerald-300 mb-3">✓ Audit Trail Benefits</h3>
        <ul className="text-emerald-200/80 text-sm space-y-2">
          <li>• Complete transparency for regulators</li>
          <li>• Accountability for every admin action</li>
          <li>• Timestamped evidence of platform governance</li>
          <li>• No deletions or modifications (immutable)</li>
          <li>• Export-ready for compliance audits</li>
        </ul>
      </div>

      {/* Data Retention Notice */}
      <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <p className="text-slate-400 text-xs">
          <strong>Data Retention:</strong> Audit logs are retained for 7 years per regulatory requirements.
          No entries can be deleted or modified by any user (even admins).
        </p>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
