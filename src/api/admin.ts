// client/src/api/admin.ts

import apiClient from './client';

// ── Locations ─────────────────────────────────────────────────────────────────
export const adminGetLocations  = ()           => apiClient.get('/admin/locations').then(r => r.data.locations);
export const adminCreateLocation= (data: any)  => apiClient.post('/admin/locations', data).then(r => r.data.location);
export const adminUpdateLocation= (id: string, data: any) => apiClient.put(`/admin/locations/${id}`, data).then(r => r.data.location);
export const adminDeleteLocation= (id: string) => apiClient.delete(`/admin/locations/${id}`).then(r => r.data);
export const adminRestoreLocation=(id: string) => apiClient.post(`/admin/locations/${id}/restore`).then(r => r.data);

// ── Tips ──────────────────────────────────────────────────────────────────────
export const adminGetTips   = (locationId: string) => apiClient.get(`/admin/locations/${locationId}/tips`).then(r => r.data.tips);
export const adminAddTip    = (locationId: string, data: any) => apiClient.post(`/admin/locations/${locationId}/tips`, data).then(r => r.data.tip);
export const adminUpdateTip = (tipId: number, data: any) => apiClient.put(`/admin/tips/${tipId}`, data).then(r => r.data.tip);
export const adminDeleteTip = (tipId: number) => apiClient.delete(`/admin/tips/${tipId}`).then(r => r.data);

// ── Pins ──────────────────────────────────────────────────────────────────────
export const adminGetPins    = () => apiClient.get('/admin/pins').then(r => r.data.pins);
export const adminCreatePin  = (data: { location_id: string; latitude: number; longitude: number; accuracy_m?: number }) => apiClient.post('/admin/pins', data).then(r => r.data.pin);
export const adminUpdatePin  = (locationId: string, data: { latitude: number; longitude: number }) => apiClient.put(`/admin/pins/${locationId}`, data).then(r => r.data.pin);
export const adminDeletePin  = (locationId: string) => apiClient.delete(`/admin/pins/${locationId}`).then(r => r.data);

// ── Stats ─────────────────────────────────────────────────────────────────────
export const adminGetStats = () => apiClient.get('/admin/stats').then(r => r.data.stats);

// ── Users ─────────────────────────────────────────────────────────────────────
export const adminGetUsers       = ()                                  => apiClient.get('/admin/users').then(r => r.data.users);
export const adminChangeUserRole = (userId: string, role: string)      => apiClient.patch(`/admin/users/${userId}/role`, { role }).then(r => r.data);
export const adminSetUserStatus  = (userId: string, is_active: boolean)=> apiClient.patch(`/admin/users/${userId}/status`, { is_active }).then(r => r.data);

// ── Audit Log ─────────────────────────────────────────────────────────────────
export const adminGetAuditLog = (page = 1, limit = 50, action?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (action) params.append('action', action);
  return apiClient.get(`/admin/audit-log?${params}`).then(r => r.data);
};
// Add at the bottom of admin.ts
export async function uploadLocationImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const token = (window as any).__campusNavToken;
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/image`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }

  const data = await res.json();
  return data.url; // Returns the Cloudinary URL
}