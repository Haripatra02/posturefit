import { apiClient } from './client';
import { WorkSession } from '../types';

export const sessionApi = {
  async startSession(planned_duration: number): Promise<WorkSession> {
    return apiClient<WorkSession>('/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ planned_duration }),
    });
  },

  async updateSession(
    id: string,
    params: {
      status: 'in_progress' | 'paused' | 'completed' | 'cancelled';
      actual_tracked_duration: number;
      breaks_taken?: number;
    }
  ): Promise<WorkSession> {
    return apiClient<WorkSession>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },

  async recordBreak(sessionId: string): Promise<{ breaks_taken: number; pointsAwarded: number }> {
    return apiClient<{ breaks_taken: number; pointsAwarded: number }>(`/sessions/${sessionId}/break`, {
      method: 'POST',
    });
  },

  async getSessionHistory(limit = 20): Promise<WorkSession[]> {
    return apiClient<WorkSession[]>(`/sessions/history?limit=${limit}`);
  },
};
