// client/src/components/AdminLocationForm.tsx
// Form for creating and editing campus locations from the admin panel

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { adminCreateLocation, adminUpdateLocation } from '../api/admin';

interface Props {
  location?: any;   // null = create mode, object = edit mode
  onSave:   () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: '1', label: 'Academic' },
  { value: '2', label: 'Residential' },
  { value: '3', label: 'Dining' },
  { value: '4', label: 'Recreation' },
  { value: '5', label: 'Services' },
];

const REGIONS = [
  { value: '',  label: 'None (not a hostel)' },
  { value: '1', label: 'Upschool' },
  { value: '2', label: 'Downschool' },
];

export default function AdminLocationForm({ location, onSave, onCancel }: Props) {
  const isEditing = !!location;

  const [form, setForm] = useState({
    id:               location?.id            || '',
    name:             location?.name          || '',
    description:      location?.description   || '',
    image_url:        location?.image_url     || '',
    hours:            location?.hours         || '',
    contact_email:    location?.contact_email || '',
    contact_phone:    location?.contact_phone || '',
    is_high_rise:     location?.is_high_rise  || false,
    floors:           location?.floors        || '',
    category_id:      location?.category_id   || '',
    hostel_region_id: location?.hostel_region_id || '',
  });

  const [imgError,  setImgError]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      floors:           form.floors           ? parseInt(form.floors as string) : null,
      category_id:      parseInt(form.category_id as string),
      hostel_region_id: form.hostel_region_id ? parseInt(form.hostel_region_id as string) : null,
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

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

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

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ID - only on create */}
          {!isEditing && (
            <div>
              <label className={labelClass}>Location ID</label>
              <input name="id" value={form.id} onChange={handleChange} required
                placeholder="e.g. 10, 4l" className={inputClass} />
              <p className="mt-1 text-xs text-gray-400">Short unique identifier. Cannot be changed later.</p>
            </div>
          )}

          {/* Name */}
          <div className={!isEditing ? '' : 'md:col-span-1'}>
            <label className={labelClass}>Location Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Main Library" className={inputClass} />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required className={inputClass}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Hostel Region */}
          <div>
            <label className={labelClass}>Hostel Region</label>
            <select name="hostel_region_id" value={form.hostel_region_id} onChange={handleChange} className={inputClass}>
              {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required
              rows={3} placeholder="Full description of this location..."
              className={`${inputClass} h-auto resize-none py-2`} />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className={labelClass}>Image URL</label>
            <input name="image_url" value={form.image_url} onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-...?w=800&q=80"
              className={inputClass} />
            {form.image_url && (
              <div className="mt-2 h-24 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                  onLoad={() => setImgError(false)}
                />
                {imgError && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500">
                    ⚠ Image URL not reachable
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hours */}
          <div>
            <label className={labelClass}>Operating Hours</label>
            <input name="hours" value={form.hours} onChange={handleChange}
              placeholder="Mon-Fri: 7:00 AM - 5:00 PM" className={inputClass} />
          </div>

          {/* Contact Email */}
          <div>
            <label className={labelClass}>Contact Email</label>
            <input name="contact_email" type="email" value={form.contact_email} onChange={handleChange}
              placeholder="office@mu.ac.zm" className={inputClass} />
          </div>

          {/* Contact Phone */}
          <div>
            <label className={labelClass}>Contact Phone</label>
            <input name="contact_phone" value={form.contact_phone} onChange={handleChange}
              placeholder="+260-214-000-001" className={inputClass} />
          </div>

          {/* High Rise */}
          <div className="flex items-center gap-3 pt-4">
            <input type="checkbox" id="is_high_rise" name="is_high_rise"
              checked={form.is_high_rise} onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="is_high_rise" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              High-Rise Building
            </label>
          </div>

          {/* Floors */}
          {form.is_high_rise && (
            <div>
              <label className={labelClass}>Number of Floors</label>
              <input name="floors" type="number" min="2" value={form.floors} onChange={handleChange}
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
    </div>
  );
}
