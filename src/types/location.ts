// client/src/types/location.ts
// Updated to support both the old static data format and the new API response format

export type LocationCategory = 'academic' | 'residential' | 'dining' | 'recreation' | 'services';
export type HostelRegion     = 'upschool' | 'downschool';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id:          string;
  name:        string;
  category:    LocationCategory;
  description: string;
  hours:       string;

  // Image — old format uses 'image', API uses 'image_url'
  image?:      string;
  image_url?:  string;

  // Contact — old format uses single 'contact' string, API uses separate fields
  contact?:        string;
  contact_email?:  string;
  contact_phone?:  string;

  tips?: string[];    // old static format
  // API returns tips as: [{ text: string, order: number }]

  // Hostel fields — old format uses camelCase, API uses snake_case
  hostelRegion?:  HostelRegion;
  hostel_region?: HostelRegion;

  isHighRise?:  boolean;
  is_high_rise?: boolean;

  floors?: number;

  // Map coordinates from API
  latitude?:  number | null;
  longitude?: number | null;

  // Audit fields from API
  is_active?:  boolean;
  created_at?: string;
  updated_at?: string;

  // Legacy field (old static format)
  coordinates?: MapCoordinates;
}
