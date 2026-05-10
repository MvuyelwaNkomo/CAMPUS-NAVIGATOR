// client/src/api/auth.ts

import apiClient from './client';
import { LoginCredentials, RegisterData, User } from '../types/auth';

export async function loginApi(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
}

export async function registerApi(data: RegisterData): Promise<{ message: string }> {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getMeApi(): Promise<{ user: User }> {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const res = await apiClient.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPasswordApi(token: string, new_password: string): Promise<{ message: string }> {
  const res = await apiClient.post('/auth/reset-password', { token, new_password });
  return res.data;
}
