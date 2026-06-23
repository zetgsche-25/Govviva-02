import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGovBr: (name: string, email: string, cpf: string, level: 'BRONZE' | 'SILVER' | 'GOLD') => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('govviva_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('govviva_token');
    setToken(null);
    setUser(null);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      const { user, token } = data;
      localStorage.setItem('govviva_token', token);
      setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGovBr = async (name: string, email: string, cpf: string, level: 'BRONZE' | 'SILVER' | 'GOLD') => {
    try {
      const data = await api.post('/auth/govbr/simulate', { name, email, cpf, govbr_level: level });
      const { user: returnedUser, token: returnedToken } = data;
      localStorage.setItem('govviva_token', returnedToken);
      setToken(returnedToken);
      setUser(returnedUser);
    } catch (error) {
      throw error;
    }
  };

  const checkSession = useCallback(async () => {
    const storedToken = localStorage.getItem('govviva_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
      setToken(storedToken);
    } catch (error) {
      console.error('Session validation failed', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkSession();

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth_expired', handleAuthExpired);
    return () => window.removeEventListener('auth_expired', handleAuthExpired);
  }, [checkSession, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithGovBr,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
