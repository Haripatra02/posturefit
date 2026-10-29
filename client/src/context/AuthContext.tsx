import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { Profile, UserPreferences } from '../types';

interface AuthContextType {
  user: { id: string; email: string; role?: string } | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: { display_name: string; timezone?: string }) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('posturefit_token');
      if (!token) {
        setUser(null);
        setProfile(null);
        setPreferences(null);
        setIsLoading(false);
        return;
      }

      const res = await authApi.getMe();
      setUser(res.user);
      setProfile(res.profile);
      setPreferences(res.preferences);
    } catch (err) {
      localStorage.removeItem('posturefit_token');
      setUser(null);
      setProfile(null);
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('posturefit_token', res.token);
      await fetchUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        email,
        password,
        display_name: displayName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });
      localStorage.setItem('posturefit_token', res.token);
      await fetchUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      // Use demo user credentials
      const res = await authApi.login({
        email: 'alex.rivera@posturefit.demo',
        password: 'password123',
      });
      localStorage.setItem('posturefit_token', res.token);
      await fetchUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('posturefit_token');
    setUser(null);
    setProfile(null);
    setPreferences(null);
  };

  const updateProfile = async (updates: { display_name: string; timezone?: string }) => {
    const updated = await authApi.updateProfile(updates);
    setProfile(updated);
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const updated = await authApi.updatePreferences(updates);
    setPreferences(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
        updatePreferences,
        refreshUser: fetchUserData,
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
