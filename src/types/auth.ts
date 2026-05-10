// client/src/types/auth.ts

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_number?: string;
  role: 'student' | 'admin' | 'superadmin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  student_number: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
