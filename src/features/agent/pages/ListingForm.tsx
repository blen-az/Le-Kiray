import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VehicleCategory, Listing, ListingStatus, isBookableCategory } from '../../../types';
import { createListing, updateListing, getListing, validateListingForPublish } from '../../../services/listingService';
import { canPublishListing } from '../../../services/subscriptionService';
import { initCloudinaryWidget, openCloudinaryUploadWidget, CloudinaryUploadResult } from '../../../lib/cloudinary';

import { useAuth } from '../../../features/auth/context/AuthContext';

const CATEGORIES = [
  { value: VehicleCategory.COMPACT, label: 'Compact Car', description: 'Small sedans and hatchbacks' },
  { value: VehicleCategory.MID_SIZE, label: 'Mid-Size', description: 'Family sedans and crossovers' },
  { value: VehicleCategory.FAMILY, label: 'Family/SUV', description: 'Large SUVs and family vehicles' },
  { value: VehicleCategory.VAN, label: 'Van', description: 'Cargo and passenger vans' },
  { value: VehicleCategory.EARTH_MOVING, label: 'Earth Moving', description: 'Excavators, dozers, loaders' },
];

const ListingForm: React.FC = () => {
  const { currentUser: user } = useAuth();
  const agentId = user?.id || '';
  const agentName = user?.name || '';
  
  if (!user) return null;
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
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadListing(id);
    }
    // Initialize Cloudinary widget
    setWidgetLoading(true);
    initCloudinaryWidget()
      .then(() => {
        setWidgetReady(true);
        setWidgetLoading(false);
      })
      .catch((error) => {
        console.error('Failed to initialize Cloudinary widget:', error);
        setWidgetLoading(false);
      });
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

  const handleImageUpload = async () => {
    setWidgetLoading(true);
    try {
      await openCloudinaryUploadWidget((error, result) => {
        if (error) {
          console.error('Upload error:', error);
          setErrors(prev => [...prev, error?.message || 'Failed to upload image']);
          return;
        }

        if (result?.event === 'success') {
          const uploadResult = result.info as CloudinaryUploadResult;
          setFormData(prev => ({
            ...prev,
            imageUrls: [...(prev.imageUrls || []), uploadResult.secure_url],
          }));
        }
      });
    } catch (error) {
      console.error('Error opening widget:', error);
      setErrors(prev => [...prev, 'Failed to open upload widget']);
    } finally {
      setWidgetLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || [],
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

        // Check if agent is approved
        if (!user.isApproved) {
          setErrors(['Your account is pending approval. You can save as draft, but cannot publish yet.']);
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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto">
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
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleChange('category', cat.value)}
                className={`p-3 sm:p-4 rounded-xl border text-left transition-all ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
              Make *
            </label>
            <input
              type="text"
              value={formData.make || ''}
              onChange={(e) => handleChange('make', e.target.value)}
              placeholder="e.g. Toyota, CAT"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
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
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
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
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Pricing (Cars/Vans only) */}
        {!isEarthMoving && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
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

        {/* Images */}
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Images
          </label>
          <div className="mb-4">
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={!widgetReady || widgetLoading}
              className="w-full p-6 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors bg-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center justify-center">
                {widgetLoading ? (
                  <>
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-white font-bold text-sm">Loading upload widget...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white font-bold text-sm">Click to upload images</p>
                    <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP (up to 10MB each)</p>
                  </>
                )}
              </div>
            </button>
          </div>

          {formData.imageUrls && formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {formData.imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Vehicle image ${i + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications */}
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
            Specifications
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="text"
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSpec()}
              placeholder="Add a spec (e.g. 4x4, Autopilot)"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
            />
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold whitespace-nowrap text-sm"
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
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
