import React, { useState, useEffect } from 'react';
import { getListingsByAgent } from '../../../services/listingService';

interface Listing {
  id: string;
  make: string;
  model: string;
  category: string;
  agentName: string;
  status: string;
  createdAt: string;
}

const AdminListingModeration: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadListings = async () => {
      try {
        // In production, fetch all listings from all agents
        setListings([]);
      } catch (error) {
        console.error('Error loading listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

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
        <h1 className="text-3xl font-black text-white tracking-tight">Listing Moderation</h1>
        <p className="text-slate-500 mt-1">Review and enforce category & legal rules</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {['all', 'flagged', 'misclassified'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No listings to moderate
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-black text-white mb-3">Moderation Actions</h3>
        <ul className="text-slate-400 text-sm space-y-2">
          <li>✓ Review new listings for category accuracy</li>
          <li>✓ Flag misclassifications (e.g., earth-moving as car)</li>
          <li>✓ Suspend listings that violate rules</li>
          <li>✓ Override category if needed</li>
          <li>✓ Remove pricing from earth-moving equipment</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminListingModeration;
