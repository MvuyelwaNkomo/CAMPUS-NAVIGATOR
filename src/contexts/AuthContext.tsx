// client/src/contexts/AuthContext.tsx
// Provides global auth state: user, token, login, logout

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { loginApi, logoutApi, getMeApi } from '../api/auth';

interface AuthContextType extends AuthState {
  login:  (studentNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from sessionStorage
  // (sessionStorage clears on tab close — safer than localStorage)
  useEffect(() => {
    const storedToken = sessionStorage.getItem('cn_token');
    if (storedToken) {
      (window as any).__campusNavToken = storedToken;
      setToken(storedToken);
      getMeApi()
        .then(({ user }) => setUser(user))
        .catch(() => {
          sessionStorage.removeItem('cn_token');
          (window as any).__campusNavToken = null;
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const data = await loginApi({ email, password });
    // Store token in memory + sessionStorage
    (window as any).__campusNavToken = data.token;
    sessionStorage.setItem('cn_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function logout(): Promise<void> {
    try { await logoutApi(); } catch { /* ignore errors on logout */ }
    (window as any).__campusNavToken = null;
    sessionStorage.removeItem('cn_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isLoading, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
