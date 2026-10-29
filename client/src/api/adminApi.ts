import { apiClient } from './client';
import { Exercise } from '../types';

export const adminApi = {
  async createExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    return apiClient<Exercise>('/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  },

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    return apiClient<Exercise>(`/admin/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteExercise(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/admin/exercises/${id}`, {
      method: 'DELETE',
    });
  },

  async setUserRole(userId: string, role: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },
};
