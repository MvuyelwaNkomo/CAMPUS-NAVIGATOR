// client/src/api/client.ts
// Shared axios instance — automatically attaches JWT to every request

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT from memory before every request
apiClient.interceptors.request.use((config) => {
  // Token is stored on the window object to survive component re-renders
  // without persisting to localStorage (XSS protection)
  const token = (window as any).__campusNavToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      (window as any).__campusNavToken = null;
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
