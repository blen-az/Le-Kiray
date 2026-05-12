import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VehicleCategory, ListingStatus } from '../../../types';
import { createListing, updateListing, getListing } from '../../../services/listingService';
import { canPublishListing } from '../../../services/subscriptionService';
import { initCloudinaryWidget, openCloudinaryUploadWidget, CloudinaryUploadResult } from '../../../lib/cloudinary';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CATEGORIES = [
  { value: VehicleCategory.EXCAVATOR, label: 'Excavators', description: 'Tracked and wheeled excavators' },
  { value: VehicleCategory.DOZER, label: 'Dozers', description: 'Bulldozers and track tractors' },
  { value: VehicleCategory.LOADER, label: 'Loaders', description: 'Wheel loaders, track loaders' },
  { value: VehicleCategory.CRANE, label: 'Cranes', description: 'Mobile and tower cranes' },
  { value: VehicleCategory.DUMP_TRUCK, label: 'Dump Trucks', description: 'Articulated and rigid haulers' },
  { value: VehicleCategory.COMPACTOR, label: 'Compactors', description: 'Soil and asphalt compactors' },
  { value: VehicleCategory.OTHER_MACHINERY, label: 'Other', description: 'Graders, scrapers, specialized equipment' },
];

const listingSchema = z.object({
  category: z.nativeEnum(VehicleCategory),
  make: z.string().min(2, 'Make must be at least 2 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters'),
  year: z.coerce.number().min(1990).max(new Date().getFullYear()),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  specifications: z.array(z.string()),
  imageUrls: z.array(z.string()).min(1, 'At least one image is required'),
  status: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

const ListingForm: React.FC = () => {
  const { currentUser: user } = useAuth();
  const agentId = user?.id || '';
  const agentName = user?.name || '';
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState('');
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [canProceed, setCanProceed] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (agentId && !isEditing) {
        const canPublish = await canPublishListing(agentId);
        if (!canPublish.allowed) {
          setSubmitErrors([
            canPublish.reason || 'Subscription limit reached.',
            'You cannot add more vehicles at this time.'
          ]);
          setCanProceed(false);
        }
      }
    };
    checkAccess();
  }, [agentId, isEditing]);
  
  // React Query Fetching
  const { isLoading: loading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;
      const listing = await getListing(id);
      if (listing) {
        reset({
          category: listing.category,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          location: listing.location,
          description: listing.description,
          specifications: listing.specifications || [],
          imageUrls: listing.imageUrls || [],
          status: listing.status,
        });
      }
      return listing;
    },
    enabled: isEditing && !!id,
  });

  // React Query Mutation
  const mutation = useMutation({
    mutationFn: async ({ submitData, listingId }: { submitData: any, listingId?: string }) => {
      if (listingId) {
        return updateListing(listingId, submitData);
      } else {
        return createListing(submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      navigate('/agent/fleet');
    },
    onError: (error: any) => {
      console.error('Error saving listing:', error);
      let message = 'Failed to save listing. Please try again.';
      if (error.code === 'permission-denied') {
        message = 'Permission denied. Ensure your account is approved and you have an active subscription.';
      } else if (error.message) {
        message = error.message;
      }
      setSubmitErrors([message]);
      setSaving(false);
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      category: VehicleCategory.EXCAVATOR,
      year: new Date().getFullYear(),
      specifications: [],
      imageUrls: [],
    }
  });

  const category = watch('category');
  const specifications = watch('specifications') || [];
  const imageUrls = watch('imageUrls') || [];

  // Cloudinary init is now fully lazy (on-click) inside handleImageUpload

  const handleAddSpec = () => {
    if (specInput.trim()) {
      setValue('specifications', [...specifications, specInput.trim()], { shouldValidate: true });
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (index: number) => {
    setValue('specifications', specifications.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const handleImageUpload = async () => {
    setWidgetLoading(true);
    try {
      // Lazy init script only when user actually wants to upload
      await initCloudinaryWidget();
      
      await openCloudinaryUploadWidget((error, result) => {
        if (error) {
          setSubmitErrors(prev => [...prev, error?.message || 'Failed to upload image']);
          return;
        }
        if (result?.event === 'success') {
          const uploadResult = result.info as CloudinaryUploadResult;
          setValue('imageUrls', [...imageUrls, uploadResult.secure_url], { shouldValidate: true });
        }
      });
    } catch (error: any) {
      setSubmitErrors(prev => [...prev, error.message || 'Failed to open upload widget']);
    } finally {
      setWidgetLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setValue('imageUrls', imageUrls.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const onSubmit = async (data: ListingFormData, e?: React.BaseSyntheticEvent) => {
    const nativeEvent = e?.nativeEvent as SubmitEvent;
    const submitter = nativeEvent?.submitter as HTMLButtonElement | undefined;
    const isPublish = submitter?.name === 'publish';
    setSaving(true);
    setSubmitErrors([]);

    try {
      if (isPublish) {
        const canPublish = await canPublishListing(agentId);
        if (!canPublish.allowed) {
          setSubmitErrors([
            canPublish.reason || 'Cannot publish listing.',
            'You may need to select a subscription plan first.'
          ]);
          setSaving(false);
          return;
        }

        if (!user?.isApproved) {
          setSubmitErrors([
            'Your account is pending administrative approval.',
            'You can save as draft for now, but cannot publish yet.'
          ]);
          setSaving(false);
          return;
        }
      }

      const submitData = { 
        ...data, 
        status: isPublish ? 'active' : 'draft', 
        agentId, 
        agentName 
      };

      mutation.mutate({ submitData, listingId: id });
    } catch (error) {
      console.error('Error preparing listing submission:', error);
      setSubmitErrors(['An unexpected error occurred.']);
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/agent/fleet')}
          className="text-slate-500 hover:text-slate-900 text-sm font-bold mb-4 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Fleet
        </button>
        <h1 className="text-2xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isEditing ? 'Edit Listing' : 'Add New Vehicle'}
        </h1>
      </div>

      {submitErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
          <ul className="text-red-500 text-sm space-y-1">
            {submitErrors.map((err, i) => <li key={i}>• {err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">
            Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                className={`p-3 sm:p-4 rounded-xl border text-left transition-all ${
                  category === cat.value
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 '
                }`}
              >
                <p className="font-bold text-slate-900 text-sm">{cat.label}</p>
                <p className="text-xs text-slate-500">{cat.description}</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-amber-500 text-xs font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Heavy machinery uses quote-based pricing (no daily rates)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Make *</label>
            <input {...register('make')} placeholder="e.g. CAT, Komatsu" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-brand-main outline-none text-sm" />
            {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make.message}</p>}
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Model *</label>
            <input {...register('model')} placeholder="e.g. D9 Dozer" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-brand-main outline-none text-sm" />
            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Year *</label>
            <input type="number" {...register('year')} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-brand-main outline-none text-sm" />
            {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Location *</label>
          <input {...register('location')} placeholder="e.g. Bole, Addis Ababa" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-brand-main outline-none" />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Description *</label>
          <textarea {...register('description')} rows={4} placeholder="Describe the machinery, its condition, and key capabilities..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-brand-main outline-none resize-none" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Images</label>
          <button type="button" onClick={handleImageUpload} disabled={widgetLoading} className="w-full p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-main transition-colors bg-white disabled:opacity-50">
            <div className="flex flex-col items-center justify-center">
              <p className="text-slate-900 font-bold text-sm">Click to upload images</p>
              <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP (up to 10MB each)</p>
            </div>
          </button>
          {errors.imageUrls && <p className="text-red-500 text-xs mt-1">{errors.imageUrls.message}</p>}
          
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Machinery ${i}`} className="w-full h-32 object-cover rounded-xl border border-slate-200 " />
                  <button type="button" onClick={() => handleRemoveImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Specifications</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input type="text" value={specInput} onChange={e => setSpecInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSpec())} placeholder="Add a spec (e.g. 20-ton capacity, GPS enabled)" className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-brand-main outline-none text-sm" />
            <button type="button" onClick={handleAddSpec} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-bold whitespace-nowrap text-sm">Add</button>
          </div>
          {specifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specifications.map((spec, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-900 rounded-lg text-sm font-medium flex items-center gap-2">
                  {spec} <button type="button" onClick={() => handleRemoveSpec(i)} className="text-slate-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-slate-200 ">
          <button type="submit" name="draft" disabled={saving || !canProceed} className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm sm:text-base">Save as Draft</button>
          <button type="submit" name="publish" disabled={saving || !canProceed} className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-brand-main hover:bg-brand-main/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEditing ? 'Update & Publish' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
