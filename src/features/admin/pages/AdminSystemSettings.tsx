import React, { useState } from 'react';

interface SystemSettings {
  featureFlags: {
    earthMoving: boolean;
    disputes: boolean;
    advancedAnalytics: boolean;
  };
  categories: {
    name: string;
    enabled: boolean;
  }[];
  subscriptionPlans: {
    name: string;
    maxVehicles: number;
    monthlyPrice: number;
  }[];
}

const AdminSystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    featureFlags: {
      earthMoving: true,
      disputes: false,
      advancedAnalytics: false,
    },
    categories: [
      { name: 'Compact Car', enabled: true },
      { name: 'Mid-Size', enabled: true },
      { name: 'Family/SUV', enabled: true },
      { name: 'Van', enabled: true },
      { name: 'Earth Moving', enabled: true },
    ],
    subscriptionPlans: [
      { name: 'Starter', maxVehicles: 5, monthlyPrice: 0 },
      { name: 'Standard', maxVehicles: 20, monthlyPrice: 500 },
      { name: 'Professional', maxVehicles: 100, monthlyPrice: 2000 },
    ],
  });
  const [saved, setSaved] = useState(false);

  const handleFeatureFlagToggle = (key: keyof typeof settings.featureFlags) => {
    setSettings((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: !prev.featureFlags[key],
      },
    }));
    setSaved(false);
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-1">Configuration & feature toggles</p>
      </div>

      {/* Feature Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-black text-white mb-6">Feature Flags (Phase Control)</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <p className="font-bold text-white">Earth-Moving Equipment</p>
              <p className="text-sm text-slate-400 mt-1">Enable quote-based pricing for heavy equipment</p>
            </div>
            <button
              onClick={() => handleFeatureFlagToggle('earthMoving')}
              className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                settings.featureFlags.earthMoving
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.featureFlags.earthMoving ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <p className="font-bold text-white">Disputes Module</p>
              <p className="text-sm text-slate-400 mt-1">Enable dispute resolution system</p>
            </div>
            <button
              onClick={() => handleFeatureFlagToggle('disputes')}
              className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                settings.featureFlags.disputes
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.featureFlags.disputes ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Advanced Analytics</p>
              <p className="text-sm text-slate-400 mt-1">Enable detailed performance reports</p>
            </div>
            <button
              onClick={() => handleFeatureFlagToggle('advancedAnalytics')}
              className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                settings.featureFlags.advancedAnalytics
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.featureFlags.advancedAnalytics ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-black text-white mb-6">Vehicle Categories</h2>
        <div className="space-y-3">
          {settings.categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <p className="font-bold text-white">{cat.name}</p>
              <button
                onClick={() => {
                  const newCats = [...settings.categories];
                  newCats[idx].enabled = !cat.enabled;
                  setSettings((prev) => ({ ...prev, categories: newCats }));
                  setSaved(false);
                }}
                className={`px-3 py-1 text-sm rounded-lg font-bold transition-colors ${
                  cat.enabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {cat.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-black text-white mb-6">Subscription Plans</h2>
        <div className="space-y-3">
          {settings.subscriptionPlans.map((plan, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Plan</p>
                <p className="text-white font-bold">{plan.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Max Vehicles</p>
                <p className="text-white font-bold">{plan.maxVehicles}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Price/Month</p>
                <p className="text-white font-bold">{plan.monthlyPrice} ETB</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          ℹ️ To modify plans, contact the platform architect. Changes require database migration.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
        >
          Save Settings
        </button>
        {saved && (
          <div className="px-4 py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold">
            ✓ Settings saved
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-black text-white mb-3">Configuration Best Practices</h3>
        <ul className="text-slate-400 text-sm space-y-2">
          <li>✓ Feature flags control Phase 1/2/3 rollout</li>
          <li>✓ Categories are configurable but rarely changed</li>
          <li>✓ Plans require code updates (stored in code, not DB)</li>
          <li>✓ Keep this page minimal and boring</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
