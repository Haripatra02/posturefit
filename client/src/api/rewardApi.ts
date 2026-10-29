import { apiClient } from './client';
import { Badge, GamificationSummary, RewardEvent } from '../types';

export interface CompleteActivityResult {
  completion: any;
  pointsAwarded: number;
  newlyEarnedBadges: any[];
}

export const rewardApi = {
  async completeActivity(params: {
    exercise_id?: string;
    challenge_id?: string;
    duration_seconds: number;
    completion_status?: 'completed' | 'skipped' | 'interrupted';
    idempotency_key: string;
  }): Promise<CompleteActivityResult> {
    return apiClient<CompleteActivityResult>('/rewards/complete-activity', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getSummary(): Promise<GamificationSummary> {
    return apiClient<GamificationSummary>('/rewards/summary');
  },

  async getBadges(): Promise<Badge[]> {
    return apiClient<Badge[]>('/rewards/badges');
  },

  async getLedger(): Promise<RewardEvent[]> {
    return apiClient<RewardEvent[]>('/rewards/ledger');
  },
};
