import React, { useState } from 'react';
import { getAgentProfile, updateAgentProfile, createAgentProfile } from '../../../services/agentService';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AgentProfilePage: React.FC = () => {
  const { currentUser: user } = useAuth();
  
  if (!user) return null;
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
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

  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ['agentProfile', user.id],
    queryFn: async () => {
      const data = await getAgentProfile(user.id);
      if (data) {
        setFormData({
          companyName: data.companyName,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          serviceLocations: data.serviceLocations,
          businessAddress: data.businessAddress || '',
          logoUrl: data.logoUrl || '',
        });
      } else {
        setFormData(prev => ({
          ...prev,
          contactEmail: user.email,
          companyName: user.companyName || '',
        }));
      }
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (updatedData: any) => {
      if (profile) {
        return updateAgentProfile(profile.id, updatedData);
      } else {
        return createAgentProfile({
          userId: user.id,
          ...updatedData,
          isApproved: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentProfile', user.id] });
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    },
    onError: (error) => {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    },
    onSettled: () => {
      setSaving(false);
    }
  });

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
    mutation.mutate(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] blueprint-grid">
        <div className="w-10 h-10 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-900 placeholder-slate-450 focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 outline-none transition-all text-sm font-semibold";

  return (
    <div className="p-8 min-h-screen bg-[#F7F9FC] blueprint-grid max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Company Profile <span className="text-[#FF8A00] font-medium text-lg px-2.5 py-0.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">Identity</span>
        </h1>
        <p className="text-slate-500 mt-1">Manage your brand name, contact credentials, and logistics locations</p>
      </div>

      {/* Status */}
      {profile && (
        <div className={`relative overflow-hidden rounded-[22px] p-5 mb-8 flex items-start gap-4 shadow-sm border ${
          profile.isApproved 
            ? 'bg-emerald-500/5 border-emerald-500/25' 
            : 'bg-[#FF8A00]/5 border-brand-accent/25'
        }`}>
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-current" style={{ color: profile.isApproved ? '#10B981' : '#FF8A00' }} />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            profile.isApproved ? 'bg-emerald-500/10' : 'bg-brand-accent/10'
          }`}>
            {profile.isApproved ? (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-extrabold text-sm ${profile.isApproved ? 'text-emerald-700' : 'text-[#D06F00]'}`}>
              {profile.isApproved ? 'Verified Partner Status' : 'Pending Verification Pipeline'}
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {profile.isApproved 
                ? "Your company profile is verified. Listings published are immediately visible to clients." 
                : 'Your profile details are currently under administrative review. This process generally takes 1-2 business days.'}
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-[20px] p-5 mb-8 border-2 font-bold text-xs ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-650' 
            : 'bg-rose-50 border-rose-100 text-rose-650'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Your official company or brand name"
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="+251 9XX XXX XXX"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="contact@company.com"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Service Locations
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
              placeholder="Add depot hub location (e.g. Addis Ababa, Gondar)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-6 py-3.5 bg-slate-200 hover:bg-slate-350 text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-colors"
            >
              Add Depot
            </button>
          </div>
          {formData.serviceLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.serviceLocations.map(location => (
                <span 
                  key={location}
                  className="px-3.5 py-2 bg-white border border-slate-250/60 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(location)}
                    className="text-slate-400 hover:text-red-500 font-extrabold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Business Address
          </label>
          <input
            type="text"
            value={formData.businessAddress}
            onChange={(e) => handleChange('businessAddress', e.target.value)}
            placeholder="Depot headquarters or office address"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-brand-main hover:bg-brand-main/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-brand-main/20 hover:-translate-y-0.5"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {profile ? 'Update Verified Profile' : 'Save Company Details'}
        </button>
      </form>
    </div>
  );
};

export default AgentProfilePage;
