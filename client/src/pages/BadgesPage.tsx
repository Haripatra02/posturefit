import React, { useState, useEffect } from 'react';
import {
  Award,
  Flame,
  Zap,
  Sparkles,
  Trophy,
  Target,
  Clock,
  ShieldCheck,
  Footprints,
  Medal,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { rewardApi } from '../api/rewardApi';
import { Badge as BadgeType, GamificationSummary, RewardEvent } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const BadgesPage: React.FC = () => {
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [ledger, setLedger] = useState<RewardEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, badgeRes, ledgerRes] = await Promise.all([
          rewardApi.getSummary(),
          rewardApi.getBadges(),
          rewardApi.getLedger(),
        ]);
        setSummary(sumRes);
        setBadges(badgeRes);
        setLedger(ledgerRes);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints':
        return <Footprints className="w-6 h-6" />;
      case 'Flame':
        return <Flame className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6" />;
      case 'Clock':
        return <Clock className="w-6 h-6" />;
      case 'Medal':
        return <Medal className="w-6 h-6" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6" />;
      case 'Target':
        return <Target className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  if (isLoading && !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  const s = summary || {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <Award className="w-8 h-8 text-accent-amber" />
            Rewards & Achievement Badges
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Build consistent desk wellness habits, unlock new ranks, and collect milestone badges.
          </p>
        </div>
      </div>

      {/* Level Banner Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-brand-900 via-brand-800 to-teal-900 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-700/80 text-brand-200 border border-brand-600/60">
              <Trophy className="w-3.5 h-3.5 text-accent-amber" />
              <span>Current Status: Level {s.level}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {s.level_name}
            </h2>
            <p className="text-xs sm:text-sm text-brand-200 leading-relaxed">
              You have accumulated <strong>{s.total_points} total points</strong> across your desk sessions. Earn{' '}
              <strong>{s.points_to_next_level} more points</strong> to reach Level {s.level + 1}!
            </p>

            {/* Level Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-brand-300 font-semibold mb-1.5">
                <span>Level {s.level}</span>
                <span>{s.level_progress_percent}% to Level {s.level + 1}</span>
              </div>
              <div className="w-full bg-brand-950/60 h-3 rounded-full overflow-hidden border border-brand-700/50">
                <div
                  className="bg-brand-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.level_progress_percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Highlights */}
          <div className="flex md:flex-col gap-4 border-t md:border-t-0 md:border-l border-brand-700/60 pt-4 md:pt-0 md:pl-8 text-center md:text-left justify-around md:justify-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold">Active Streak</p>
              <p className="text-2xl sm:text-3xl font-black text-white flex items-center md:justify-start justify-center gap-1.5 mt-0.5">
                <Flame className="w-6 h-6 text-amber-400" />
                {s.current_streak} {s.current_streak === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold">Longest Streak</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {s.longest_streak} days
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Badges Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-heading">
            Milestone Badges ({badges.filter((b) => b.earned).length} / {badges.length} Unlocked)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map((b) => {
            const isEarned = Boolean(b.earned);
            return (
              <Card
                key={b.id}
                className={`p-5 flex items-start gap-4 transition-all ${
                  isEarned
                    ? 'border-brand-200 bg-white shadow-sm'
                    : 'border-surface-border bg-surface-subtle/60 opacity-75'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isEarned
                      ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                      : 'bg-stone-200/70 text-stone-400 border-stone-300'
                  }`}
                >
                  {isEarned ? getBadgeIcon(b.icon_name) : <Lock className="w-5 h-5 text-stone-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-sm text-charcoal-heading truncate">{b.name}</h3>
                    {isEarned && (
                      <span className="text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">{b.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transparent Reward Rules Table */}
      <Card className="p-6">
        <h3 className="font-bold text-base text-charcoal-heading mb-2">
          Reward Rules & Points Ledger System
        </h3>
        <p className="text-xs text-charcoal-muted mb-4">
          All points are calculated centrally by the backend and recorded in an immutable ledger with idempotency verification.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-surface-border text-charcoal-muted font-semibold">
                <th className="pb-3">Action / Milestone</th>
                <th className="pb-3">Points Awarded</th>
                <th className="pb-3">Idempotency & Limits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-charcoal-body">
              <tr>
                <td className="py-3 font-medium">Complete an Exercise Activity</td>
                <td className="py-3 font-bold text-brand-700">+20 Points</td>
                <td className="py-3 text-xs text-charcoal-muted">Verified per unique completion key</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Complete a 5-Minute Challenge</td>
                <td className="py-3 font-bold text-brand-700">+60 Points</td>
                <td className="py-3 text-xs text-charcoal-muted">Awarded on final challenge step</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Take a Scheduled Work Break</td>
                <td className="py-3 font-bold text-blue-700">+10 Points</td>
                <td className="py-3 text-xs text-charcoal-muted">Logged with active session identifier</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Daily Movement Goal Hit</td>
                <td className="py-3 font-bold text-emerald-700">+50 Points Bonus</td>
                <td className="py-3 text-xs text-charcoal-muted">Awarded once per calendar day</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">7-Day Movement Streak Milestone</td>
                <td className="py-3 font-bold text-amber-700">+100 Points Bonus</td>
                <td className="py-3 text-xs text-charcoal-muted">Awarded once per 7-day milestone</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
