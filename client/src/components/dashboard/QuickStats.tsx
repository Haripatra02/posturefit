import React from 'react';
import { Flame, Sparkles, Coffee, Activity, Trophy } from 'lucide-react';
import { Card } from '../common/Card';

interface QuickStatsProps {
  currentStreak: number;
  pointsToday: number;
  breaksToday: number;
  activitiesToday: number;
  level: number;
  levelName: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  currentStreak,
  pointsToday,
  breaksToday,
  activitiesToday,
  level,
  levelName,
}) => {
  const stats = [
    {
      title: 'Current Streak',
      value: `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`,
      description: currentStreak > 0 ? 'Consistent habit!' : 'Start today!',
      icon: Flame,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
    },
    {
      title: 'Points Today',
      value: `+${pointsToday}`,
      description: 'Earned today',
      icon: Sparkles,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      title: 'Movement Breaks',
      value: `${breaksToday}`,
      description: 'Breaks taken',
      icon: Coffee,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Posture Level',
      value: `Lvl ${level}`,
      description: levelName,
      icon: Trophy,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Card key={idx} className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                {s.title}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight">
                {s.value}
              </p>
              <p className="text-xs text-charcoal-muted mt-0.5 truncate">{s.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
