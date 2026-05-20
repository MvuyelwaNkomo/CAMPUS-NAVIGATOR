// client/src/components/AdminLocationForm.tsx

import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, ImageIcon } from 'lucide-react';
import { adminCreateLocation, adminUpdateLocation, uploadLocationImage } from '../api/admin';
import apiClient from '../api/client';

interface Category {
  id:    number;
  name:  string;
  label: string;
}

interface HostelRegion {
  id:    number;
  name:  string;
  label: string;
}

interface Props {
  location?: any;
  onSave:    () => void;
  onCancel:  () => void;
}

export default function AdminLocationForm({ location, onSave, onCancel }: Props) {
  const isEditing = !!location;

  const [categories,    setCategories]    = useState<Category[]>([]);
  const [hostelRegions, setHostelRegions] = useState<HostelRegion[]>([]);
  const [loadingMeta,   setLoadingMeta]   = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [error,         setError]         = useState('');
  const [imgError,      setImgError]      = useState(false);

  const [form, setForm] = useState({
    name:             location?.name             || '',
    description:      location?.description      || '',
    image_url:        location?.image_url        || '',
    hours:            location?.hours            || '',
    contact_email:    location?.contact_email    || '',
    contact_phone:    location?.contact_phone    || '',
    is_high_rise:     location?.is_high_rise     || false,
    floors:           location?.floors           || '',
    category_id:      location?.category_id      || '',
    hostel_region_id: location?.hostel_region_id || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories and hostel regions from database
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, regRes] = await Promise.all([
          apiClient.get('/admin/categories'),
          apiClient.get('/admin/hostel-regions'),
        ]);
        setCategories(catRes.data.categories);
        setHostelRegions(regRes.data.regions);
      } catch {
        // Fallback to hardcoded values if endpoint not available
        setCategories([
          { id: 1, name: 'academic',    label: 'Academic' },
          { id: 2, name: 'residential', label: 'Residential' },
          { id: 3, name: 'dining',      label: 'Dining' },
          { id: 4, name: 'recreation',  label: 'Recreation' },
          { id: 5, name: 'services',    label: 'Services' },
        ]);
        setHostelRegions([
          { id: 1, name: 'upschool',   label: 'Upschool' },
          { id: 2, name: 'downschool', label: 'Downschool' },
        ]);
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }

  // Show hostel region only when Residential is selected
  const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
  const isResidential    = selectedCategory?.name === 'residential';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.category_id) {
      setError('Please select a category.');
      return;
    }

    if (isResidential && !form.hostel_region_id) {
      setError('Please select a hostel region for residential locations.');
      return;
    }

    setSaving(true);

    const payload = {
      name:             form.name,
      description:      form.description,
      image_url:        form.image_url        || null,
      hours:            form.hours            || null,
      contact_email:    form.contact_email    || null,
      contact_phone:    form.contact_phone    || null,
      is_high_rise:     form.is_high_rise,
      floors:           form.floors ? parseInt(String(form.floors)) : null,
      category_id:      parseInt(String(form.category_id)),
      hostel_region_id: form.hostel_region_id ? parseInt(String(form.hostel_region_id)) : null,
    };

    try {
      if (isEditing) {
        await adminUpdateLocation(location.id, payload);
      } else {
        await adminCreateLocation(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass  = "w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass  = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? `Edit: ${location.name}` : 'Add New Location'}
        </h3>
        <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loadingMeta ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <div className="md:col-span-2">
              <label className={labelClass}>Location Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                required placeholder="e.g. Main Library"
                className={inputClass} />
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>Category *</label>
              <select name="category_id" value={form.category_id}
                onChange={handleChange} required className={inputClass}>
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Hostel Region — only shown for Residential */}
            {isResidential && (
              <div>
                <label className={labelClass}>Hostel Region *</label>
                <select name="hostel_region_id" value={form.hostel_region_id}
                  onChange={handleChange} className={inputClass}>
                  <option value="">Select region...</option>
                  {hostelRegions.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={form.description}
                onChange={handleChange} required rows={3}
                placeholder="Full description of this location..."
                className={`${inputClass} h-auto resize-none py-2`} />
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className={labelClass}>Location Image</label>

              {/* Upload Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500">Uploading image...</p>
                  </div>
                ) : form.image_url ? (
                  <div className="relative">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Click to replace image
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-gray-400">
                      JPEG, PNG or WebP · Max 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setError('');
                  try {
                    const url = await uploadLocationImage(file);
                    setForm(prev => ({ ...prev, image_url: url }));
                  } catch (err: any) {
                    setError(err.message || 'Image upload failed. Please try again.');
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </div>

            {/* Hours */}
            <div>
              <label className={labelClass}>Operating Hours</label>
              <input name="hours" value={form.hours} onChange={handleChange}
                placeholder="Mon-Fri: 7:00 AM - 5:00 PM"
                className={inputClass} />
            </div>

            {/* Contact Email */}
            <div>
              <label className={labelClass}>Contact Email</label>
              <input name="contact_email" type="email" value={form.contact_email}
                onChange={handleChange} placeholder="office@mu.ac.zm"
                className={inputClass} />
            </div>

            {/* Contact Phone */}
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input name="contact_phone" value={form.contact_phone}
                onChange={handleChange} placeholder="+260-214-000-001"
                className={inputClass} />
            </div>

            {/* High Rise toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="is_high_rise" name="is_high_rise"
                checked={form.is_high_rise} onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="is_high_rise" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                High-Rise Building
              </label>
            </div>

            {/* Floors — only shown for high rise */}
            {form.is_high_rise && (
              <div>
                <label className={labelClass}>Number of Floors</label>
                <input name="floors" type="number" min="2"
                  value={form.floors} onChange={handleChange}
                  placeholder="e.g. 3" className={inputClass} />
              </div>
            )}

          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Create Location'}</>
              }
            </button>
          </div>
        </form>
      )}
    </div>
  );
}