// client/src/api/locations.ts

import apiClient from './client';
import { Location } from '../types/location'; // your existing type

interface LocationFilters {
  search?: string;
  category?: string;
  hostel_region?: string;
}

export async function fetchLocations(filters?: LocationFilters): Promise<Location[]> {
  const params = new URLSearchParams();
  if (filters?.search)        params.append('search', filters.search);
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters?.hostel_region) params.append('hostel_region', filters.hostel_region);

  const res = await apiClient.get(`/locations?${params.toString()}`);
  return res.data.locations;
}

export async function fetchLocationById(id: string): Promise<Location> {
  const res = await apiClient.get(`/locations/${id}`);
  return res.data.location;
}
