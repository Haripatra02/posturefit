import { describe, it, expect } from 'vitest';
import { calculateStreak, getDateStringInTimezone } from '../src/services/streakService.js';
import { ActivityCompletion, WorkSession } from '../src/types/index.js';

describe('Streak Calculation Service', () => {
  it('formats dates correctly according to user timezone', () => {
    const date = new Date('2026-10-24T01:00:00Z');
    // In UTC, date is 2026-10-24
    expect(getDateStringInTimezone(date, 'UTC')).toBe('2026-10-24');
    // In America/New_York (UTC-4), it was 2026-10-23 21:00
    expect(getDateStringInTimezone(date, 'America/New_York')).toBe('2026-10-23');
  });

  it('returns 0 streak for empty history', () => {
    const result = calculateStreak([], [], 'UTC');
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.isActiveToday).toBe(false);
  });

  it('calculates active streak today', () => {
    const today = new Date();
    const completions: ActivityCompletion[] = [
      {
        id: '1',
        user_id: 'u1',
        completed_at: today.toISOString(),
        duration_seconds: 60,
        completion_status: 'completed',
        idempotency_key: 'c1',
        points_awarded: 20,
        created_at: today.toISOString(),
      },
    ];

    const result = calculateStreak(completions, [], 'UTC');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.isActiveToday).toBe(true);
  });

  it('maintains streak if active yesterday but not yet today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    const completions: ActivityCompletion[] = [
      {
        id: '1',
        user_id: 'u1',
        completed_at: dayBeforeYesterday.toISOString(),
        duration_seconds: 60,
        completion_status: 'completed',
        idempotency_key: 'c1',
        points_awarded: 20,
        created_at: dayBeforeYesterday.toISOString(),
      },
      {
        id: '2',
        user_id: 'u1',
        completed_at: yesterday.toISOString(),
        duration_seconds: 60,
        completion_status: 'completed',
        idempotency_key: 'c2',
        points_awarded: 20,
        created_at: yesterday.toISOString(),
      },
    ];

    const result = calculateStreak(completions, [], 'UTC');
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
    expect(result.isActiveToday).toBe(false);
  });

  it('resets current streak to 0 if gap is larger than 1 day', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const completions: ActivityCompletion[] = [
      {
        id: '1',
        user_id: 'u1',
        completed_at: threeDaysAgo.toISOString(),
        duration_seconds: 60,
        completion_status: 'completed',
        idempotency_key: 'c1',
        points_awarded: 20,
        created_at: threeDaysAgo.toISOString(),
      },
    ];

    const result = calculateStreak(completions, [], 'UTC');
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(1);
  });
});
