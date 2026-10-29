import { config } from '../config.js';
import { store } from '../db/store.js';
import { calculateStreak, getDateStringInTimezone } from './streakService.js';
import { GamificationSummary, RewardEvent, UserBadge } from '../types/index.js';

export class GamificationService {
  /**
   * Get full gamification progress summary for a user.
   */
  static async getUserSummary(userId: string): Promise<GamificationSummary> {
    const [rewardEvents, completions, workSessions, userBadges, profile] = await Promise.all([
      store.getUserRewardEvents(userId),
      store.getUserCompletions(userId),
      store.getUserWorkSessions(userId),
      store.getUserBadges(userId),
      store.getProfile(userId),
    ]);

    const totalPoints = rewardEvents.reduce((acc, r) => acc + r.points_delta, 0);
    const streakInfo = calculateStreak(completions, workSessions, profile?.timezone || 'UTC');

    const levelInfo = config.getLevel(totalPoints);
    const prevThreshold = levelInfo.level === 1 ? 0 : config.getLevel(levelInfo.threshold - 100).threshold;
    const levelSpan = levelInfo.threshold - prevThreshold;
    const progressInLevel = Math.max(0, totalPoints - prevThreshold);
    const levelProgressPercent = Math.min(100, Math.round((progressInLevel / (levelSpan || 100)) * 100));

    const totalBreaks = workSessions.reduce((acc, s) => acc + (s.breaks_taken || 0), 0);

    return {
      total_points: totalPoints,
      level: levelInfo.level,
      level_name: levelInfo.name,
      level_progress_percent: levelProgressPercent,
      points_to_next_level: Math.max(0, levelInfo.threshold - totalPoints),
      current_streak: streakInfo.currentStreak,
      longest_streak: streakInfo.longestStreak,
      badges_earned_count: userBadges.length,
      total_activities_count: completions.filter((c) => c.completion_status === 'completed').length,
      total_breaks_count: totalBreaks,
    };
  }

  /**
   * Award points for completing an exercise or challenge, check daily goal, check streak, evaluate badges.
   */
  static async handleActivityCompletion(
    userId: string,
    completionId: string,
    isChallenge: boolean,
    exerciseId?: string
  ): Promise<{ pointsAwarded: number; newlyEarnedBadges: UserBadge[]; newRewardEvents: RewardEvent[] }> {
    const profile = await store.getProfile(userId);
    const preferences = await store.getPreferences(userId);
    const tz = profile?.timezone || 'UTC';
    const todayStr = getDateStringInTimezone(new Date(), tz);

    const newRewardEvents: RewardEvent[] = [];
    const newlyEarnedBadges: UserBadge[] = [];

    // 1. Base Points for Activity Completion
    const basePoints = isChallenge ? config.points.exerciseCompletion * 3 : config.points.exerciseCompletion;
    const baseEvent = await store.addRewardEvent({
      user_id: userId,
      event_type: isChallenge ? 'challenge_completion' : 'exercise_completion',
      points_delta: basePoints,
      source_reference: completionId,
      idempotency_key: `act_comp:${completionId}`,
    });
    if (baseEvent) newRewardEvents.push(baseEvent);

    // 2. Check Daily Goal Completion
    const [completions, workSessions] = await Promise.all([
      store.getUserCompletions(userId),
      store.getUserWorkSessions(userId),
    ]);

    const todayCompletions = completions.filter(
      (c) => c.completion_status === 'completed' && getDateStringInTimezone(new Date(c.completed_at), tz) === todayStr
    );
    const todayBreaks = workSessions.filter(
      (s) => getDateStringInTimezone(new Date(s.created_at), tz) === todayStr
    ).reduce((sum, s) => sum + (s.breaks_taken || 0), 0);

    const totalTodayActions = todayCompletions.length + todayBreaks;

    if (totalTodayActions >= preferences.daily_goal) {
      // Award daily goal bonus once per day
      const goalBonusEvent = await store.addRewardEvent({
        user_id: userId,
        event_type: 'daily_goal_bonus',
        points_delta: config.points.dailyGoalBonus,
        source_reference: `daily_goal_${todayStr}`,
        idempotency_key: `daily_goal:${userId}:${todayStr}`,
      });
      if (goalBonusEvent) newRewardEvents.push(goalBonusEvent);
    }

    // 3. Evaluate Streaks & Milestones
    const streakInfo = calculateStreak(completions, workSessions, tz);
    if (streakInfo.currentStreak >= 7) {
      const streakBonusEvent = await store.addRewardEvent({
        user_id: userId,
        event_type: 'streak_milestone_bonus',
        points_delta: config.points.streak7DayBonus,
        source_reference: `streak_7_${todayStr}`,
        idempotency_key: `streak_7:${userId}:${streakInfo.currentStreak}`,
      });
      if (streakBonusEvent) newRewardEvents.push(streakBonusEvent);
    }

    // 4. Badge Evaluation
    const allBadges = await store.getBadges();
    const currentBadges = await store.getUserBadges(userId);
    const earnedBadgeIds = new Set(currentBadges.map((b) => b.badge_id));

    const totalActivities = completions.filter((c) => c.completion_status === 'completed').length;
    const challengeCount = completions.filter((c) => c.challenge_id && c.completion_status === 'completed').length;
    const totalPoints = (await store.getUserRewardEvents(userId)).reduce((sum, r) => sum + r.points_delta, 0);

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let eligible = false;
      const rule = badge.achievement_rule;

      if (rule.type === 'activity_count' && totalActivities >= (rule.threshold || 1)) {
        eligible = true;
      } else if (rule.type === 'streak_days' && streakInfo.currentStreak >= (rule.threshold || 3)) {
        eligible = true;
      } else if (rule.type === 'challenge_count' && challengeCount >= (rule.threshold || 5)) {
        eligible = true;
      } else if (rule.type === 'points_total' && totalPoints >= (rule.threshold || 500)) {
        eligible = true;
      } else if (rule.type === 'category_count' && rule.category) {
        const catExercises = await store.getExercises(rule.category);
        const catExIds = new Set(catExercises.map((e) => e.id));
        const catCompletions = completions.filter(
          (c) => c.exercise_id && catExIds.has(c.exercise_id) && c.completion_status === 'completed'
        ).length;
        if (catCompletions >= (rule.threshold || 10)) {
          eligible = true;
        }
      }

      if (eligible) {
        const earned = await store.awardBadge(userId, badge.id);
        if (earned) newlyEarnedBadges.push(earned);
      }
    }

    const totalPointsAwarded = newRewardEvents.reduce((sum, r) => sum + r.points_delta, 0);
    return {
      pointsAwarded: totalPointsAwarded,
      newlyEarnedBadges,
      newRewardEvents,
    };
  }

  /**
   * Award points for taking a scheduled movement break during a work session.
   */
  static async handleBreakCompletion(
    userId: string,
    sessionId: string,
    breakNumber: number
  ): Promise<{ pointsAwarded: number; newRewardEvent: RewardEvent | null }> {
    const breakEvent = await store.addRewardEvent({
      user_id: userId,
      event_type: 'break_completion',
      points_delta: config.points.breakCompletion,
      source_reference: `${sessionId}_break_${breakNumber}`,
      idempotency_key: `break:${sessionId}:${breakNumber}`,
    });

    // Check break milestone badge
    const workSessions = await store.getUserWorkSessions(userId);
    const totalBreaks = workSessions.reduce((acc, s) => acc + (s.breaks_taken || 0), 0);
    if (totalBreaks >= 10) {
      await store.awardBadge(userId, 'break_pro_10');
    }

    return {
      pointsAwarded: breakEvent ? breakEvent.points_delta : 0,
      newRewardEvent: breakEvent,
    };
  }
}
