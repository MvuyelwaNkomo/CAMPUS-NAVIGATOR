// client/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';
import { loginApi, logoutApi, getMeApi } from '../api/auth';

interface AuthContextType extends AuthState {
  login:  (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from sessionStorage
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

  async function login(credentials: LoginCredentials): Promise<void> {
    const data = await loginApi(credentials);
    (window as any).__campusNavToken = data.token;
    sessionStorage.setItem('cn_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function logout(): Promise<void> {
    try { await logoutApi(); } catch {}
    (window as any).__campusNavToken = null;
    sessionStorage.removeItem('cn_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!user,
      isLoading,
      login, logout
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
