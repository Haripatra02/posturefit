import { apiClient } from './client';
import { DashboardData } from '../types';

export const progressApi = {
  async getDashboard(): Promise<DashboardData> {
    return apiClient<DashboardData>('/progress/dashboard');
  },

  async getAnalytics(): Promise<any> {
    return apiClient<any>('/progress/analytics');
  },
};
