import { apiClient } from './client';
import { Profile, UserPreferences } from '../types';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  token: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  profile: Profile;
  preferences: UserPreferences;
}

export const authApi = {
  async register(params: {
    email: string;
    password: string;
    display_name: string;
    timezone?: string;
  }): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async login(params: { email: string; password: string }): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async resetPassword(params: { email: string; new_password?: string; token?: string }): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getMe(): Promise<MeResponse> {
    return apiClient<MeResponse>('/auth/me');
  },

  async updateProfile(params: { display_name: string; timezone?: string }): Promise<Profile> {
    return apiClient<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },

  async updatePreferences(params: Partial<UserPreferences>): Promise<UserPreferences> {
    return apiClient<UserPreferences>('/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },
};
