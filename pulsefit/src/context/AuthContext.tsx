import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'admin' | 'user') => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pulsefit_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        // Auto sign in as Demo User by default so the preview loads instantly without blocking the user
        await quickDemoLogin('user');
        return;
      }
      const res = await api.auth.getMe();
      setUser(res.data.user);
    } catch (err) {
      console.warn('Session verification note:', err);
      // Auto login as demo user if current token expired
      await quickDemoLogin('user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password: pass });
      localStorage.setItem('pulsefit_token', res.token);
      setToken(res.token);
      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      localStorage.setItem('pulsefit_token', res.token);
      setToken(res.token);
      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    try {
      const email = role === 'admin' ? 'admin@fitness.com' : 'user@fitness.com';
      const pass = role === 'admin' ? 'admin123' : 'user123';
      const res = await api.auth.login({ email, password: pass });
      localStorage.setItem('pulsefit_token', res.token);
      setToken(res.token);
      setUser(res.data.user);
    } catch (error) {
      console.error('Quick demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pulsefit_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const res = await api.users.updateProfile(data);
    setUser(res.data.user);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.auth.getMe();
        setUser(res.data.user);
      } catch {
        // ignore
      }
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'admin@fitness.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
