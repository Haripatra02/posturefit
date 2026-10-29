import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Timer,
  Zap,
  BookOpen,
  Coffee,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { progressApi } from '../../src/api/progressApi';
import { DashboardData } from '../../src/types';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { QuickStats } from '../components/dashboard/QuickStats';
import { DailyGoalProgress } from '../components/dashboard/DailyGoalProgress';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { BreakPromptModal } from '../components/timer/BreakPromptModal';

export const DashboardPage: React.FC = () => {
  const { profile, preferences } = useAuth();
  const {
    status: timerStatus,
    mode: timerMode,
    remainingSeconds,
    startWork,
    pauseTimer,
    resumeTimer,
  } = useTimer();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await progressApi.getDashboard();
        setData(res);
      } catch {
        // Fallback or offline
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const timerMinutes = Math.floor(remainingSeconds / 60);
  const timerSeconds = remainingSeconds % 60;
  const formattedTimer = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;

  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const todayStats = data?.today || {
    date: new Date().toISOString().split('T')[0],
    completed_activities: 0,
    breaks_taken: 0,
    points_earned: 0,
    daily_goal: preferences?.daily_goal || 3,
    goal_progress_percent: 0,
  };

  const gamification = data?.gamification || {
    total_points: 0,
    level: 1,
    level_name: 'Posture Novice',
    level_progress_percent: 0,
    points_to_next_level: 100,
    current_streak: 0,
    longest_streak: 0,
    badges_earned_count: 0,
    total_activities_count: 0,
    total_breaks_count: 0,
  };

  const todayChallenge = data?.today_challenge;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Greeting & Today Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight">
            {getGreeting()},{' '}
            <span className="text-brand-600">{profile?.display_name || 'Desk Athlete'}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">{todayFormatted}</p>
        </div>

        {/* Quick Start Floating Actions */}
        <div className="flex items-center gap-2">
          <Link to="/timer">
            <Button variant="outline" size="sm" leftIcon={<Timer className="w-4 h-4 text-brand-600" />}>
              Open Timer
            </Button>
          </Link>
          <Link to="/challenge">
            <Button variant="primary" size="sm" leftIcon={<Zap className="w-4 h-4 fill-white" />}>
              5-Min Challenge
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Metrics Cards */}
      <QuickStats
        currentStreak={gamification.current_streak}
        pointsToday={todayStats.points_earned}
        breaksToday={todayStats.breaks_taken}
        activitiesToday={todayStats.completed_activities}
        level={gamification.level}
        levelName={gamification.level_name}
      />

      {/* Highlights Grid: Live Timer Status + Recommended Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Timer Status Card */}
        <Card className="p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-surface-subtle">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
                Work Session Status
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  timerStatus === 'running'
                    ? 'bg-emerald-500 animate-pulse'
                    : timerStatus === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-stone-300'
                }`}
              />
            </div>

            <div className="my-2 flex items-baseline gap-3">
              <span className="text-4xl font-mono font-black text-charcoal-heading">
                {formattedTimer}
              </span>
              <span className="text-xs font-semibold text-charcoal-muted uppercase">
                {timerMode === 'work' ? 'Sitting / Work' : 'Break'}
              </span>
            </div>

            <p className="text-xs text-charcoal-muted mt-2">
              {timerStatus === 'running'
                ? 'Interval active. Sit upright with relaxed shoulders.'
                : timerStatus === 'paused'
                ? 'Timer paused. Ready to continue when you are.'
                : 'Timer idle. Start your next focused interval.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between gap-2">
            {timerStatus === 'idle' ? (
              <Button size="sm" variant="primary" onClick={() => startWork()}>
                <Play className="w-3.5 h-3.5 fill-white mr-1.5" /> Start Focus Session
              </Button>
            ) : timerStatus === 'running' ? (
              <Button size="sm" variant="secondary" onClick={pauseTimer}>
                Pause
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={resumeTimer}>
                Resume
              </Button>
            )}

            <Link to="/timer">
              <Button size="sm" variant="ghost" className="text-xs">
                Full Timer View →
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recommended Daily Challenge Card */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-brand-900 to-brand-950 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="amber" size="sm">
                Recommended Daily Challenge
              </Badge>
              <span className="text-xs text-brand-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-amber" /> +60 pts reward
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {todayChallenge?.title || 'The 5-Minute Desk Reset'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-200 mt-2 max-w-xl leading-relaxed">
              {todayChallenge?.description ||
                'A quick sequence of 5 guided movements counteracting forward head posture and tight shoulders.'}
            </p>

            {todayChallenge?.exercises && (
              <div className="mt-4 flex flex-wrap gap-2">
                {todayChallenge.exercises.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-brand-800/80 px-2.5 py-1 rounded-lg border border-brand-700/60 text-brand-100"
                  >
                    {idx + 1}. {item.exercise?.title?.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-brand-800/80 flex items-center justify-between relative z-10">
            <span className="text-xs text-brand-300 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-brand-400" />
              Duration: ~5 minutes
            </span>
            <Link to="/challenge">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Guided Challenge
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Progress & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart data={data?.weekly_chart || []} />
        </div>
        <div className="space-y-6">
          <DailyGoalProgress
            completedActions={todayStats.completed_activities + todayStats.breaks_taken}
            targetGoal={todayStats.daily_goal}
            progressPercent={todayStats.goal_progress_percent}
          />

          {/* Quick Posture Reminder Pill */}
          <Card className="p-5 bg-surface-subtle/60 border border-surface-border">
            <h4 className="text-xs font-bold text-charcoal-heading uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" /> Ergonomic Quick Tip
            </h4>
            <p className="text-xs text-charcoal-body leading-relaxed">
              <strong>The 20-20-20 Rule:</strong> Every 20 minutes, look at an object at least 20 feet away for 20 seconds to relax your eye ciliary muscles and naturally prompt a posture check.
            </p>
            <Link
              to="/posture-guide"
              className="inline-block mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
            >
              Read full posture awareness guide →
            </Link>
          </Card>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <RecentActivity activities={data?.recent_activity || []} />

      {/* Break prompt modal if work timer finishes */}
      <BreakPromptModal />
    </div>
  );
};
