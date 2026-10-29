import { describe, it, expect, beforeEach } from 'vitest';
import { GamificationService } from '../src/services/gamificationService.js';
import { store } from '../src/db/store.js';

describe('Gamification & Reward Service', () => {
  const testUserId = 'test-gamer-123';

  beforeEach(() => {
    // Reset user state in test store
    store.activityCompletions.clear();
    store.rewardEvents.clear();
    store.userBadges.clear();
  });

  it('awards exercise completion points and creates ledger entry', async () => {
    const res = await GamificationService.handleActivityCompletion(
      testUserId,
      'comp-1',
      false,
      '00000000-0000-0000-0000-000000000001'
    );

    expect(res.pointsAwarded).toBe(20);
    expect(res.newRewardEvents.length).toBeGreaterThanOrEqual(1);
    expect(res.newRewardEvents[0].event_type).toBe('exercise_completion');
    expect(res.newRewardEvents[0].points_delta).toBe(20);
  });

  it('prevents duplicate reward events using idempotency keys', async () => {
    const event1 = await store.addRewardEvent({
      user_id: testUserId,
      event_type: 'exercise_completion',
      points_delta: 20,
      source_reference: 'comp-dup',
      idempotency_key: 'idem-test-key-100',
    });

    const event2 = await store.addRewardEvent({
      user_id: testUserId,
      event_type: 'exercise_completion',
      points_delta: 20,
      source_reference: 'comp-dup',
      idempotency_key: 'idem-test-key-100', // same key!
    });

    expect(event1?.id).toBe(event2?.id);
    const all = await store.getUserRewardEvents(testUserId);
    expect(all.length).toBe(1);
  });

  it('awards First Step badge upon first completed activity', async () => {
    await store.createActivityCompletion({
      user_id: testUserId,
      completed_at: new Date().toISOString(),
      duration_seconds: 60,
      completion_status: 'completed',
      idempotency_key: 'first-comp',
      points_awarded: 20,
    });

    const res = await GamificationService.handleActivityCompletion(
      testUserId,
      'first-comp',
      false
    );

    const badges = await store.getUserBadges(testUserId);
    const hasFirstStep = badges.some((b) => b.badge_id === 'first_step');
    expect(hasFirstStep).toBe(true);
  });

  it('calculates user levels and progression correctly', async () => {
    // Add 150 points
    await store.addRewardEvent({
      user_id: testUserId,
      event_type: 'exercise_completion',
      points_delta: 150,
      idempotency_key: 'pts-150',
    });

    const summary = await GamificationService.getUserSummary(testUserId);
    expect(summary.total_points).toBe(150);
    expect(summary.level).toBe(2);
    expect(summary.level_name).toBe('Ergonomic Explorer');
    expect(summary.points_to_next_level).toBe(100);
  });
});
