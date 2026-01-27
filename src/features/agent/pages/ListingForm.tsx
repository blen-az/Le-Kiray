import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VehicleCategory, Listing, ListingStatus, isBookableCategory } from '../../../types';
import { createListing, updateListing, getListing, validateListingForPublish } from '../../../services/listingService';
import { canPublishListing } from '../../../services/subscriptionService';

interface ListingFormProps {
  agentId: string;
  agentName: string;
}

const CATEGORIES = [
  { value: VehicleCategory.COMPACT, label: 'Compact Car', description: 'Small sedans and hatchbacks' },
  { value: VehicleCategory.MID_SIZE, label: 'Mid-Size', description: 'Family sedans and crossovers' },
  { value: VehicleCategory.FAMILY, label: 'Family/SUV', description: 'Large SUVs and family vehicles' },
  { value: VehicleCategory.VAN, label: 'Van', description: 'Cargo and passenger vans' },
  { value: VehicleCategory.EARTH_MOVING, label: 'Earth Moving', description: 'Excavators, dozers, loaders' },
];

const ListingForm: React.FC<ListingFormProps> = ({ agentId, agentName }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<Partial<Listing>>({
    category: VehicleCategory.COMPACT,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    dailyRate: undefined,
    weeklyRate: undefined,
    location: '',
    description: '',
    specifications: [],
    imageUrls: [],
    status: 'draft',
  });

  const [specInput, setSpecInput] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadListing(id);
    }
  }, [id, isEditing]);

  const loadListing = async (listingId: string) => {
    setLoading(true);
    try {
      const listing = await getListing(listingId);
      if (listing) {
        setFormData(listing);
      }
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Listing, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleAddSpec = () => {
    if (specInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...(prev.specifications || []), specInput.trim()],
      }));
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (publish: boolean = false) => {
    setSaving(true);
    setErrors([]);

    try {
      // Validate if publishing
      if (publish) {
        const validationErrors = validateListingForPublish(formData);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setSaving(false);
          return;
        }

        // Check subscription limits
        const canPublish = await canPublishListing(agentId);
        if (!canPublish.allowed) {
          setErrors([canPublish.reason || 'Cannot publish listing']);
          setSaving(false);
          return;
        }
      }

      const status: ListingStatus = publish ? 'active' : 'draft';
      const data = { ...formData, status, agentId, agentName };

      if (isEditing && id) {
        await updateListing(id, data);
      } else {
        await createListing(data as Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>);
      }

      navigate('/agent/fleet');
    } catch (error) {
      console.error('Error saving listing:', error);
      setErrors(['Failed to save listing. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  const isEarthMoving = formData.category === VehicleCategory.EARTH_MOVING;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/agent/fleet')}
          className="text-slate-400 hover:text-white text-sm font-bold mb-4 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Fleet
        </button>
        <h1 className="text-3xl font-black text-white tracking-tight">
          {isEditing ? 'Edit Listing' : 'Add New Vehicle'}
        </h1>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
          <ul className="text-red-500 text-sm space-y-1">
            {errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="space-y-8">
        {/* Category Selection */}
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">
            Category
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleChange('category', cat.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.category === cat.value
                    ? cat.value === VehicleCategory.EARTH_MOVING
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <p className="font-bold text-white text-sm">{cat.label}</p>
                <p className="text-xs text-slate-500">{cat.description}</p>
              </button>
            ))}
          </div>
          {isEarthMoving && (
            <p className="mt-3 text-amber-500 text-xs font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Earth-moving equipment uses quote-based pricing (no daily rates)
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
              Make *
            </label>
            <input
              type="text"
              value={formData.make || ''}
              onChange={(e) => handleChange('make', e.target.value)}
              placeholder="e.g. Toyota, CAT"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
              Model *
            </label>
            <input
              type="text"
              value={formData.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="e.g. Land Cruiser, 336 Excavator"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
              Year *
            </label>
            <input
              type="number"
              value={formData.year || ''}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing (Cars/Vans only) */}
        {!isEarthMoving && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
                Daily Rate (ETB) *
              </label>
              <input
                type="number"
                value={formData.dailyRate || ''}
                onChange={(e) => handleChange('dailyRate', parseInt(e.target.value))}
                placeholder="e.g. 4500"
                min="0"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
                Weekly Rate (ETB)
              </label>
              <input
                type="number"
                value={formData.weeklyRate || ''}
                onChange={(e) => handleChange('weeklyRate', parseInt(e.target.value))}
                placeholder="Optional discount rate"
                min="0"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g. Bole, Addis Ababa"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Description *
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the vehicle, its condition, and key features..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* Specifications */}
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Specifications
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSpec()}
              placeholder="Add a spec (e.g. 4x4, Autopilot)"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
            >
              Add
            </button>
          </div>
          {formData.specifications && formData.specifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.specifications.map((spec, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(i)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEditing ? 'Update & Publish' : 'Publish Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingForm;
