import { apiClient } from './client';
import { Challenge } from '../types';

export const challengeApi = {
  async getChallenges(): Promise<Challenge[]> {
    return apiClient<Challenge[]>('/challenges');
  },

  async getChallengeById(id: string): Promise<Challenge> {
    return apiClient<Challenge>(`/challenges/${id}`);
  },
};
