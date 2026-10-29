import { apiClient } from './client';
import { Exercise } from '../types';

export const exerciseApi = {
  async getExercises(category?: string): Promise<Exercise[]> {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return apiClient<Exercise[]>(`/exercises${query}`);
  },

  async getExerciseById(id: string): Promise<Exercise> {
    return apiClient<Exercise>(`/exercises/${id}`);
  },
};
