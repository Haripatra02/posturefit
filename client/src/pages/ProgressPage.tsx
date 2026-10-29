import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  Coffee,
  Activity,
  Flame,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { progressApi } from '../api/progressApi';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';

export const ProgressPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'exercise' | 'session'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, anaRes] = await Promise.all([
          progressApi.getDashboard(),
          progressApi.getAnalytics(),
        ]);
        setDashboard(dashRes);
        setAnalytics(anaRes);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const gamification = analytics?.gamification || {
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
    level: 1,
  };

  const totalMinutes = analytics?.total_minutes_tracked || 0;
  const totalBreaks = analytics?.total_breaks || 0;
  const totalActivities = analytics?.total_activities || 0;

  const categoryBreakdown = analytics?.category_breakdown || {};
  const recentCompletions = analytics?.recent_completions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-brand-600" />
            Activity Analytics & Progress
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Review your tracked focus blocks, break consistency, and mobility milestones.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Total Tracked Time</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading">{totalMinutes} min</p>
          <p className="text-xs text-charcoal-muted mt-0.5">Desk focus time logged</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Breaks Taken</span>
            <Coffee className="w-4 h-4 text-accent-amber" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading">{totalBreaks}</p>
          <p className="text-xs text-charcoal-muted mt-0.5">Postural rest breaks</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Activities Done</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading">{totalActivities}</p>
          <p className="text-xs text-charcoal-muted mt-0.5">Mobility moves completed</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading">{gamification.current_streak} days</p>
          <p className="text-xs text-charcoal-muted mt-0.5">Max: {gamification.longest_streak} days</p>
        </Card>
      </div>

      {/* Weekly Activity Trends Chart */}
      <WeeklyChart data={dashboard?.weekly_chart || []} />

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="font-bold text-base text-charcoal-heading mb-4">
          Exercise Category Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { key: 'neck_shoulder', label: 'Neck & Shoulders' },
            { key: 'wrist_hand', label: 'Wrists & Hands' },
            { key: 'chest_upper_body', label: 'Chest & Upper Body' },
            { key: 'seated_mobility', label: 'Seated Mobility' },
            { key: 'leg_ankle', label: 'Legs & Ankles' },
            { key: 'standing_breaks', label: 'Standing Movement' },
          ].map((cat) => {
            const count = categoryBreakdown[cat.key] || 0;
            return (
              <div key={cat.key} className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <p className="text-xs font-medium text-charcoal-muted">{cat.label}</p>
                <p className="text-xl font-bold text-charcoal-heading mt-1">{count} completed</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Activity History Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-base text-charcoal-heading">
            Detailed Activity History
          </h3>
        </div>

        {recentCompletions.length === 0 ? (
          <p className="text-xs text-charcoal-muted py-6 text-center">
            No completed activities recorded in the database yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-surface-border text-charcoal-muted font-semibold">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Date Completed</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-charcoal-body">
                {recentCompletions.map((comp: any) => (
                  <tr key={comp.id}>
                    <td className="py-3 font-medium">
                      {comp.challenge_id ? '5-Min Challenge' : 'Exercise Move'}
                    </td>
                    <td className="py-3">{comp.duration_seconds}s</td>
                    <td className="py-3 text-xs text-charcoal-muted">
                      {new Date(comp.completed_at).toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-brand-700">+{comp.points_awarded} pts</td>
                    <td className="py-3">
                      <Badge variant="success" size="sm">
                        {comp.completion_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
