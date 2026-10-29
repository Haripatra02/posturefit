import { Router, Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { GamificationService } from '../services/gamificationService.js';
import { getDateStringInTimezone } from '../services/streakService.js';

const router = Router();

// GET /api/progress/dashboard
router.get('/dashboard', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const [profile, preferences, gamification, completions, workSessions, challenges] = await Promise.all([
      store.getProfile(userId),
      store.getPreferences(userId),
      GamificationService.getUserSummary(userId),
      store.getUserCompletions(userId, 50),
      store.getUserWorkSessions(userId, 20),
      store.getChallenges(),
    ]);

    const tz = profile?.timezone || 'UTC';
    const todayStr = getDateStringInTimezone(new Date(), tz);

    // Today's metrics
    const todayCompletions = completions.filter(
      (c) => c.completion_status === 'completed' && getDateStringInTimezone(new Date(c.completed_at), tz) === todayStr
    );
    const todaySessions = workSessions.filter(
      (s) => getDateStringInTimezone(new Date(s.created_at), tz) === todayStr
    );
    const todayBreaks = todaySessions.reduce((sum, s) => sum + (s.breaks_taken || 0), 0);

    const rewardEvents = await store.getUserRewardEvents(userId);
    const todayPoints = rewardEvents
      .filter((r) => getDateStringInTimezone(new Date(r.created_at), tz) === todayStr)
      .reduce((sum, r) => sum + r.points_delta, 0);

    const totalActionsToday = todayCompletions.length + todayBreaks;
    const goalProgressPercent = Math.min(
      100,
      Math.round((totalActionsToday / Math.max(1, preferences.daily_goal)) * 100)
    );

    // Weekly activity data (Past 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getDateStringInTimezone(d, tz);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(d);

      const dayCompletions = completions.filter(
        (c) => c.completion_status === 'completed' && getDateStringInTimezone(new Date(c.completed_at), tz) === dateStr
      ).length;

      const dayBreaks = workSessions
        .filter((s) => getDateStringInTimezone(new Date(s.created_at), tz) === dateStr)
        .reduce((sum, s) => sum + (s.breaks_taken || 0), 0);

      const dayPoints = rewardEvents
        .filter((r) => getDateStringInTimezone(new Date(r.created_at), tz) === dateStr)
        .reduce((sum, r) => sum + r.points_delta, 0);

      weeklyData.push({
        date: dateStr,
        day: dayName,
        activities: dayCompletions,
        breaks: dayBreaks,
        points: dayPoints,
      });
    }

    // Pick today's recommended challenge (rotates predictably)
    const todayChallenge = challenges.length > 0 ? challenges[new Date().getDay() % challenges.length] : null;

    // Recent combined activities (last 5)
    const recentActivity = completions.slice(0, 8).map((c) => {
      const ex = c.exercise_id ? store.exercises.get(c.exercise_id) : null;
      const ch = c.challenge_id ? store.challenges.get(c.challenge_id) : null;
      return {
        id: c.id,
        type: c.challenge_id ? 'challenge' : 'exercise',
        title: ch?.title || ex?.title || 'Movement Activity',
        completed_at: c.completed_at,
        duration_seconds: c.duration_seconds,
        points: c.points_awarded,
      };
    });

    res.json({
      success: true,
      data: {
        profile,
        preferences,
        total_points: gamification.total_points,
        level_name: gamification.level_name,
        today: {
          date: todayStr,
          completed_activities: todayCompletions.length,
          breaks_taken: todayBreaks,
          points_earned: todayPoints,
          daily_goal: preferences.daily_goal,
          goal_progress_percent: goalProgressPercent,
        },
        gamification,
        today_challenge: todayChallenge,
        weekly_chart: weeklyData,
        recent_activity: recentActivity,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard metrics' });
  }
});

// GET /api/progress/weekly
router.get('/weekly', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const [profile, completions, workSessions, rewardEvents] = await Promise.all([
      store.getProfile(userId),
      store.getUserCompletions(userId, 100),
      store.getUserWorkSessions(userId, 50),
      store.getUserRewardEvents(userId),
    ]);

    const tz = profile?.timezone || 'UTC';
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getDateStringInTimezone(d, tz);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(d);

      const dayCompletions = completions.filter(
        (c) => c.completion_status === 'completed' && getDateStringInTimezone(new Date(c.completed_at), tz) === dateStr
      ).length;

      const dayBreaks = workSessions
        .filter((s) => getDateStringInTimezone(new Date(s.created_at), tz) === dateStr)
        .reduce((sum, s) => sum + (s.breaks_taken || 0), 0);

      const dayPoints = rewardEvents
        .filter((r) => getDateStringInTimezone(new Date(r.created_at), tz) === dateStr)
        .reduce((sum, r) => sum + r.points_delta, 0);

      weeklyData.push({
        date: dateStr,
        day: dayName,
        activities: dayCompletions,
        breaks: dayBreaks,
        points: dayPoints,
      });
    }

    res.json({ success: true, data: weeklyData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve weekly metrics' });
  }
});

// GET /api/progress/analytics
router.get('/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const [completions, workSessions, rewardEvents, gamification] = await Promise.all([
      store.getUserCompletions(userId, 500),
      store.getUserWorkSessions(userId, 200),
      store.getUserRewardEvents(userId),
      GamificationService.getUserSummary(userId),
    ]);

    const totalMinutesTracked = Math.round(
      workSessions.reduce((acc, s) => acc + (s.actual_tracked_duration || 0), 0) / 60
    );

    const totalBreaks = workSessions.reduce((acc, s) => acc + (s.breaks_taken || 0), 0);

    // Category breakdown
    const categoryCounts: Record<string, number> = {
      neck_shoulder: 0,
      wrist_hand: 0,
      chest_upper_body: 0,
      seated_mobility: 0,
      leg_ankle: 0,
      standing_breaks: 0,
    };

    for (const c of completions) {
      if (c.exercise_id && c.completion_status === 'completed') {
        const ex = store.exercises.get(c.exercise_id);
        if (ex && categoryCounts[ex.category] !== undefined) {
          categoryCounts[ex.category]++;
        }
      }
    }

    res.json({
      success: true,
      data: {
        gamification,
        total_minutes_tracked: totalMinutesTracked,
        total_breaks: totalBreaks,
        total_activities: completions.filter((c) => c.completion_status === 'completed').length,
        category_breakdown: categoryCounts,
        recent_sessions: workSessions.slice(0, 10),
        recent_completions: completions.slice(0, 15),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve analytics' });
  }
});

export default router;
