import React, { useState, useEffect } from 'react';
import { AgentProfile } from '../../../types';
import { getAgentProfile, updateAgentProfile, createAgentProfile } from '../../../services/agentService';
import { useAuth } from '../../../features/auth/context/AuthContext';

const AgentProfilePage: React.FC = () => {
  const { currentUser: user } = useAuth();
  
  if (!user) return null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPhone: '',
    contactEmail: '',
    serviceLocations: [] as string[],
    businessAddress: '',
    logoUrl: '',
  });
  const [locationInput, setLocationInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      const data = await getAgentProfile(user.id);
      if (data) {
        setProfile(data);
        setFormData({
          companyName: data.companyName,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          serviceLocations: data.serviceLocations,
          businessAddress: data.businessAddress || '',
          logoUrl: data.logoUrl || '',
        });
      } else {
        // Pre-fill with user data
        setFormData(prev => ({
          ...prev,
          contactEmail: user.email,
          companyName: user.companyName || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleAddLocation = () => {
    if (locationInput.trim() && !formData.serviceLocations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        serviceLocations: [...prev.serviceLocations, locationInput.trim()],
      }));
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      serviceLocations: prev.serviceLocations.filter(l => l !== location),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (profile) {
        await updateAgentProfile(profile.id, formData);
      } else {
        await createAgentProfile({
          userId: user.id,
          ...formData,
          isApproved: false,
        });
      }
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">Agent Profile</h1>
        <p className="text-slate-500 mt-1">Manage your company information</p>
      </div>

      {/* Status */}
      {profile && (
        <div className={`rounded-xl p-4 mb-8 flex items-center gap-3 ${
          profile.isApproved 
            ? 'bg-emerald-500/10 border border-emerald-500/20' 
            : 'bg-amber-500/10 border border-amber-500/20'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            profile.isApproved ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          }`}>
            {profile.isApproved ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-bold ${profile.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
              {profile.isApproved ? 'Verified Agent' : 'Pending Verification'}
            </p>
            <p className="text-sm text-slate-400">
              {profile.isApproved 
                ? 'Your profile has been verified by Le\'Kiray' 
                : 'Your profile is under review. This usually takes 1-2 business days.'}
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-4 mb-8 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
            : 'bg-red-500/10 border border-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Your company or brand name"
            required
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="+251 9XX XXX XXX"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="contact@company.com"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Service Locations
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
              placeholder="Add a city (e.g. Addis Ababa)"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
            >
              Add
            </button>
          </div>
          {formData.serviceLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.serviceLocations.map(location => (
                <span 
                  key={location}
                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-medium flex items-center gap-2 border border-indigo-500/20"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(location)}
                    className="text-indigo-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Business Address
          </label>
          <input
            type="text"
            value={formData.businessAddress}
            onChange={(e) => handleChange('businessAddress', e.target.value)}
            placeholder="Optional physical address"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {profile ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default AgentProfilePage;
